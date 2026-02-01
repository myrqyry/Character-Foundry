import { PartialCharacter } from '../types';
import { validateCharacterResponse, validateImageResponse, validateTTSResponse } from '../schemas/validation';

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


// Type for TTS configuration

// Types for TTS configuration
type TTSProvider = 'google' | 'edge';

export interface TTSConfig {
  provider: TTSProvider;
  google?: {
    voice?: string;
    languageCode?: string;
    speakingRate?: number;
    pitch?: number;
  };
  edge?: {
    voice?: string;  // Can be any Voice.Name, Voice.ShortName, or Voice.FriendlyName
    rate?: string;   // e.g. '+50%' for 50% faster, '-50%' for 50% slower
    pitch?: string;  // e.g. '+50Hz' for higher pitch, '-50Hz' for lower pitch
    volume?: string; // e.g. '+50%' for 50% louder, '-50%' for 50% quieter
  };
}

// Removed unused interfaces VoiceConfig and AudioConfig



// Model configurations
// These are now dynamically loaded from the store
// const TEXT_MODEL = 'gemini-2.5-flash';
// const IMAGE_MODEL = 'gemini-2.0-flash-preview-image-generation';

// Proxy server configuration
const PROXY_BASE_URL = 'http://localhost:49152';

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

interface CharacterResponse {
  data: PartialCharacter | null;
  error: string | null;
}

export const fleshOutCharacter = async (
  partialChar: PartialCharacter
): Promise<CharacterResponse> => {
  try {
    const { textModel } = useCharacterStore.getState();
    const prompt = `Given the following partial character data, generate a complete character profile. Fill in any missing details to make the character rich and engaging. Return the character data as a JSON object. Do not include any markdown code block formatting.\n\nPartial Character Data: ${JSON.stringify(partialChar)}`;
    
    const result = await callGeminiAPI<{ model: string; prompt: string }, any>('/api/gemini/generate', {
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
    
    let text = candidate.content.parts[0].text;
    
    // Attempt to extract JSON from markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      text = jsonMatch[1];
    }
    
    // Attempt to parse the response as JSON
    try {
      const fullCharacterData = JSON.parse(text) as PartialCharacter;
      
      // Validate the parsed data
      const validation = validateCharacterResponse({
        data: { 
          ...fullCharacterData,
          updatedAt: new Date().toISOString(),
          currentVersion: 1,
          versions: []
        }, 
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

interface TTSResponse {
  data: string | null;
  error: string | null;
  provider: TTSProvider;
}

/**
 * Default TTS configuration
 */
const defaultTTSConfig: TTSConfig = {
  provider: 'google',
  google: {
    voice: 'gemini-2.5-flash-preview-tts',
    languageCode: 'en-US',
    speakingRate: 1.0,
    pitch: 0.0
  },
  edge: {
    voice: 'en-US-GuyNeural',
    rate: '+0%', // Use default rate (no change)
    pitch: '+0Hz', // Default pitch (no change)
    volume: '+0%', // Default volume (no change)
  }
};

/**
 * Convert text to speech using the specified provider
 */
import { useCharacterStore } from '../store';

export const textToSpeech = async (
  text: string,
  config: Partial<TTSConfig> = {}
): Promise<TTSResponse> => {
  if (!text) {
    return { 
      data: null, 
      error: 'No text provided',
      provider: config.provider || defaultTTSConfig.provider
    };
  }

  // Get current TTS settings from the store
  const { ttsProvider, googleTtsVoice, edgeTtsVoice } = useCharacterStore.getState();

  // Merge provided config with defaults and store settings
  const ttsConfig: TTSConfig = {
    provider: ttsProvider,
    google: { 
      ...defaultTTSConfig.google, 
      voice: googleTtsVoice, 
      ...(config.google || {}) 
    },
    edge: { 
      ...defaultTTSConfig.edge, 
      voice: edgeTtsVoice, 
      ...(config.edge || {}) 
    }
  };

  try {
    if (ttsConfig.provider === 'google') {
      return textToSpeechGoogle(text, ttsConfig);
    } else if (ttsConfig.provider === 'edge') {
      return textToSpeechEdge(text, ttsConfig);
    } else {
      throw new Error(`Unsupported TTS provider: ${ttsConfig.provider}`);
    }
  } catch (error) {
    console.error(`Error with ${ttsConfig.provider} TTS service:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to generate speech',
      provider: ttsConfig.provider
    };
  }
};

/**
 * Convert text to speech using Google's TTS via secure proxy
 */
async function textToSpeechGoogle(
  text: string,
  config: TTSConfig
): Promise<TTSResponse> {
  if (!text) return { data: null, error: 'No text provided', provider: 'google' };
  
  try {
    const requestBody = {
      text: text,
      voice_name: config.google?.voice || 'Kore',
    };

    const response = await fetch(`${PROXY_BASE_URL}/api/tts/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    const audioBase64 = responseData.audioContent;
    
    if (!audioBase64) {
      const validation = validateTTSResponse({ data: null, error: 'No audio content in response from Google TTS', provider: 'google' });
      return validation.data!;
    }

    const validation = validateTTSResponse({ 
      data: `data:audio/mp3;base64,${audioBase64}`, 
      error: null,
      provider: 'google'
    });
    return validation.success ? validation.data : { data: null, error: 'Invalid TTS response', provider: 'google' };
  } catch (error) {
    console.error('Error in Google TTS service:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Convert text to speech using edge-tts
 */
async function textToSpeechEdge(
  text: string,
  config: TTSConfig
): Promise<TTSResponse> {
  if (!text) return { data: null, error: 'No text provided', provider: 'edge' };
  
  try {
    const requestBody = {
      text: text,
      voice: config.edge?.voice || 'en-US-GuyNeural',
      rate: config.edge?.rate || '+0%',
      pitch: config.edge?.pitch || '+0Hz',
      volume: config.edge?.volume || '+0%',
    };

    const response = await fetch(`${PROXY_BASE_URL}/api/tts/edge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    const audioBase64 = responseData.audioContent;
    
    if (!audioBase64) {
      const validation = validateTTSResponse({ data: null, error: 'No audio content in response from Edge TTS', provider: 'edge' });
      return validation.data!;
    }

    const validation = validateTTSResponse({ 
      data: `data:audio/mp3;base64,${audioBase64}`, 
      error: null,
      provider: 'edge'
    });
    return validation.success ? validation.data : { data: null, error: 'Invalid TTS response', provider: 'edge' };
  } catch (error) {
    console.error('Error in Edge TTS service:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

export const evolveCharacter = async (
  character: PartialCharacter,
  prompt: string
): Promise<CharacterResponse> => {
  try {
    const { textModel } = useCharacterStore.getState();
    const evolutionPrompt = `Given the following character and the user's evolution prompt, generate an updated character profile.\n\nCurrent Character: ${JSON.stringify(character)}\n\nEvolution Prompt: ${prompt}`;
    
    const result = await callGeminiAPI('/api/gemini/generate', {
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
    
    const text = candidate.content.parts[0].text;
    
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
    const { textModel, imageModel } = useCharacterStore.getState();
    // Generate a portrait description for the character
    const descriptionPrompt = `Generate a detailed visual description for a character portrait based on the following traits. Focus on visual details like appearance, clothing, and expression. Be concise but vivid.\n\n${JSON.stringify(character)}`;
    
    // Get a detailed description of the portrait
    const descriptionResult = await callGeminiAPI('/api/gemini/generate', {
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
    
    // Generate the image using the description
    const imagePrompt = `${description}\n\nGenerate a portrait image based on this description.`;
    const imageResult = await callGeminiAPI('/api/imagen/generate', {
      prompt: imagePrompt,
      model: imageModel
    });

    // The proxy now returns a URL to the saved image
    if (!imageResult || !imageResult.imageUrl) {
      return validateImageResponse({ data: null, error: 'No image URL in response from proxy' }).data!;
    }

    // Prepend the proxy base URL if the URL is relative
    const imageUrl = imageResult.imageUrl.startsWith('/')
      ? `${PROXY_BASE_URL}${imageResult.imageUrl}`
      : imageResult.imageUrl;

    const validation = validateImageResponse({ data: imageUrl, error: null });
    return validation.success ? validation.data : { data: null, error: 'Invalid image response' };
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
    const { textModel } = useCharacterStore.getState();
    // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
    const audioData = base64Audio.split(',')[1];

    const prompt = "Describe the voice in this audio clip. Focus on characteristics like pitch, tone, pace, and any unique qualities.";

    const result = await callGeminiAPI('/api/gemini/generate', {
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

    const description = candidate.content.parts[0].text;
    return { data: description, error: null };
  } catch (error) {
    console.error('Error generating vocal description with Gemini:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to generate vocal description' };
  }
};
