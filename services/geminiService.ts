import { z } from 'zod';
import { Character, PartialCharacter } from '../types';
import { CharacterResponseSchema, ImageResponseSchema } from '../schemas/validation';
import { useSettingsStore } from '../store/settings';

// Re-export TTS from its dedicated module
export { textToSpeech, type TTSConfig, type TTSProvider } from './ttsService';

// Custom API Error class for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorType?: 'SAFETY' | 'QUOTA_EXCEEDED' | 'INVALID_REQUEST' | 'NETWORK_ERROR' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export type CharacterResponse = z.infer<typeof CharacterResponseSchema>;

// Types for TTS configuration
// Proxy server configuration
const PROXY_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface GeminiContent {
  parts: { text?: string; inlineData?: { mimeType: string; data: string } }[];
}

interface GeminiCandidate {
  content: GeminiContent;
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
}

interface ImagenProxyResponse {
  imageData: string;
  mimeType: string;
}

// Helper function to make secure API calls through proxy
const callGeminiAPI = async <TRequest, TResponse>(
  endpoint: string,
  data: TRequest,
  retries = 3,
  delay = 1000
): Promise<TResponse> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${PROXY_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        
        let errorType: APIError['errorType'] = 'UNKNOWN';
        if (response.status === 400) errorType = 'INVALID_REQUEST';
        else if (response.status === 429) errorType = 'QUOTA_EXCEEDED';
        else if (response.status === 403) errorType = 'SAFETY';
        
        // Retry on 429 (Too Many Requests) or 5xx errors
        if ((response.status === 429 || response.status >= 500) && i < retries - 1) {
          console.warn(`Retrying API call to ${endpoint} due to ${response.status} error. Attempt ${i + 1}/${retries}.`);
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
          continue;
        }
        throw new APIError(errorMessage, response.status, errorType);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      if (i < retries - 1) {
        console.warn(`Retrying API call to ${endpoint} due to network error. Attempt ${i + 1}/${retries}.`);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      throw new APIError('Failed to call Gemini API after multiple retries.', undefined, 'NETWORK_ERROR');
    }
  }
  throw new APIError('Failed to call Gemini API after multiple retries.', undefined, 'NETWORK_ERROR');
};

export const fleshOutCharacter = async (
  partialChar: Partial<Character>
): Promise<CharacterResponse> => {
  try {
    const { textModel } = useSettingsStore.getState();
    const prompt = `Given the following partial character data, generate a complete character profile. Fill in any missing details to make the character rich and engaging. Return the character data as a JSON object. Do not include any markdown code block formatting.\n\nPartial Character Data: ${JSON.stringify(partialChar)}`;
    
    const result = await callGeminiAPI<{ model: string; prompt: string }, GeminiResponse>('/api/gemini/generate', {
      model: textModel,
      prompt: prompt
    });
    
    if (!result.candidates || result.candidates.length === 0) {
      return { data: null, error: 'No response from Gemini' };
    }
    
    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return { data: null, error: 'No content in Gemini response' };
    }
    
    let text = candidate.content.parts[0].text || '';
    
    if (!text) {
        return { data: null, error: 'Empty content in Gemini response' };
    }
    
    // Attempt to extract JSON from markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      text = jsonMatch[1];
    }
    
    // Attempt to parse the response as JSON
    try {
      const parsedData = JSON.parse(text) as Record<string, unknown>;

      // Normalize to a full Character shape for validation.
      // Some Gemini responses may omit required bookkeeping fields, so we synthesize them.
      const now = new Date().toISOString();
      const fullCharacterData: Record<string, unknown> = {
        ...parsedData,
        id: partialChar.id || (typeof parsedData.id === 'string' ? parsedData.id : undefined) || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `char-${now}`),
        createdAt: partialChar.createdAt || (typeof parsedData.createdAt === 'string' ? parsedData.createdAt : undefined) || now,
        updatedAt: now,
        currentVersion: typeof parsedData.currentVersion === 'number' ? parsedData.currentVersion : 1,
        versions: Array.isArray(parsedData.versions) ? parsedData.versions : [],
      };

      // Validate the parsed data
      const validation = CharacterResponseSchema.safeParse({
        data: fullCharacterData,
        error: null
      });

      if (!validation.success) {
        console.error('Validation error:', validation.error);
        return { data: null, error: 'Invalid character data structure' };
      }

      return validation.data;
    } catch (parseError) {
      console.error('Error parsing character data:', parseError);
      console.error('Response text:', text);
      return { data: null, error: 'Failed to parse character data' };
    }
  } catch (error) {
    console.error('Error generating character details with Gemini:', error);
    if (error instanceof APIError) {
      let errorMessage = 'Failed to generate character details';
      switch (error.errorType) {
        case 'SAFETY':
          errorMessage = 'Content was blocked by safety filters. Please try different character details.';
          break;
        case 'QUOTA_EXCEEDED':
          errorMessage = 'API quota exceeded. Please try again later.';
          break;
        case 'INVALID_REQUEST':
          errorMessage = 'Invalid request. Please check your character data.';
          break;
        case 'NETWORK_ERROR':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      return { data: null, error: errorMessage };
    }
    return { data: null, error: error instanceof Error ? error.message : 'Failed to generate character details' };
  }
};

export interface EvolutionResponse {
  data: PartialCharacter | null;
  error: string | null;
}

export const evolveCharacter = async (
  character: PartialCharacter,
  prompt: string
): Promise<EvolutionResponse> => {
  try {
    const { textModel } = useSettingsStore.getState();
    const evolutionPrompt = `Given the following character and the user's evolution prompt, generate an updated character profile.\n\nCurrent Character: ${JSON.stringify(character)}\n\nEvolution Prompt: ${prompt}`;
    
    const result = await callGeminiAPI<{ model: string; prompt: string }, GeminiResponse>('/api/gemini/generate', {
      model: textModel,
      prompt: evolutionPrompt
    });
    
    if (!result.candidates || result.candidates.length === 0) {
      return { data: null, error: 'No response from Gemini' };
    }
    
    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return { data: null, error: 'No content in Gemini response' };
    }
    
    const text = candidate.content.parts[0].text || '';
    
    try {
      const updatedData = JSON.parse(text) as PartialCharacter;
      return { data: updatedData, error: null };
    } catch (parseError) {
      console.error('Error parsing evolution data:', parseError);
      return { data: null, error: 'Failed to parse evolution data' };
    }
  } catch (error) {
    console.error('Error evolving character with Gemini:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to evolve character' };
  }
};

interface ImageResponse {
  data: string | null;
  error: string | null;
}

export const generatePortrait = async (
  character: PartialCharacter
): Promise<ImageResponse> => {
  try {
    const { textModel, imageModel } = useSettingsStore.getState();
    // Generate a portrait description for the character
    const descriptionPrompt = `Generate a detailed visual description for a character portrait based on the following traits. Focus on visual details like appearance, clothing, and expression. Be concise but vivid.\n\n${JSON.stringify(character)}`;
    
    // Get a detailed description of the portrait
    const descriptionResult = await callGeminiAPI<{ model: string; prompt: string }, GeminiResponse>('/api/gemini/generate', {
      model: textModel,
      prompt: descriptionPrompt
    });
    
    if (!descriptionResult.candidates || descriptionResult.candidates.length === 0) {
      return { data: null, error: 'No description response from Gemini' };
    }
    
    const descriptionCandidate = descriptionResult.candidates[0];
    if (!descriptionCandidate.content || !descriptionCandidate.content.parts || descriptionCandidate.content.parts.length === 0) {
      return { data: null, error: 'No description content in Gemini response' };
    }
    
    const description = descriptionCandidate.content.parts[0].text;
    if (!description) {
        return { data: null, error: 'Empty description in Gemini response' };
    }
    
    // Generate the image using the description
    const imagePrompt = `${description}\n\nGenerate a portrait image based on this description.`;
    const imageResult = await callGeminiAPI<{ prompt: string; model: string }, ImagenProxyResponse>('/api/imagen/generate', {
      prompt: imagePrompt,
      model: imageModel
    });

    if (!imageResult || !imageResult.imageData) {
      const validation = ImageResponseSchema.safeParse({ data: null, error: 'No image data in response from proxy' });
      return validation.success ? (validation.data as ImageResponse) : { data: null, error: 'No image data in response from proxy' };
    }

    const validation = ImageResponseSchema.safeParse({ data: `data:image/png;base64,${imageResult.imageData}`, error: null });
    return validation.success ? (validation.data as ImageResponse) : { data: null, error: 'Invalid image response' };
  } catch (error) {
    console.error('Error generating portrait with Gemini:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to generate portrait' };
  }
};

interface VocalDescriptionResponse {
  data: string | null;
  error: string | null;
}

export const generateVocalDescription = async (
  base64Audio: string
): Promise<VocalDescriptionResponse> => {
  try {
    const { textModel } = useSettingsStore.getState();
    // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
    const audioData = base64Audio.split(',')[1];

    const prompt = "Describe the voice in this audio clip. Focus on characteristics like pitch, tone, pace, and any unique qualities.";

    const result = await callGeminiAPI<{ model: string; contents: GeminiContent[] }, GeminiResponse>('/api/gemini/generate', {
      model: textModel,
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'audio/wav', data: audioData } }
          ]
        }
      ]
    });

    if (!result.candidates || result.candidates.length === 0) {
      return { data: null, error: 'No response from Gemini' };
    }

    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return { data: null, error: 'No content in Gemini response' };
    }

    const description = candidate.content.parts[0].text || null;
    return { data: description, error: null };
  } catch (error) {
    console.error('Error generating vocal description with Gemini:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to generate vocal description' };
  }
};

