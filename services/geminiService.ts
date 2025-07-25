import { GoogleGenerativeAI } from '@google/generative-ai';
import { PartialCharacter } from '../types';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs/promises';
import { ttsSave } from 'edge-tts';

// Type for TTS configuration

// Types for TTS configuration
type TTSProvider = 'google' | 'edge';

interface TTSConfig {
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

interface VoiceConfig {
  languageCode: string;
  name: string;
}

interface AudioConfig {
  audioEncoding: string;
  speakingRate: number;
  pitch: number;
}



// Model configurations
const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-pro-vision';

// Initialize the Google Generative AI client if API key is available
let genAI: GoogleGenerativeAI | null = null;
let textModel: any = null;
let imageModel: any = null;

if (process.env.API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.API_KEY);
  if (genAI) {
    textModel = genAI.getGenerativeModel({ model: TEXT_MODEL });
    imageModel = genAI.getGenerativeModel({ model: IMAGE_MODEL });
  }
}

interface CharacterResponse {
  data: PartialCharacter | null;
  error: string | null;
}

export const fleshOutCharacter = async (
  partialChar: PartialCharacter
): Promise<CharacterResponse> => {
  if (!textModel) {
    return { data: null, error: 'Text model not initialized. API_KEY may be missing.' };
  }

  try {
    const prompt = `Given the following partial character data, generate a complete character profile. Fill in any missing details to make the character rich and engaging. Return the character data as a JSON object. Do not include any markdown code block formatting.\n\nPartial Character Data: ${JSON.stringify(partialChar)}`;
    
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    
    if (!response.text) {
      return { data: null, error: 'No response text from Gemini' };
    }
    
    let text = response.text();
    
    // Attempt to extract JSON from markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      text = jsonMatch[1];
    }
    
    // Attempt to parse the response as JSON
    try {
      const fullCharacterData = JSON.parse(text) as PartialCharacter;
      return { 
        data: { 
          ...fullCharacterData,
          updatedAt: new Date().toISOString(),
          currentVersion: 1,
          versions: []
        }, 
        error: null 
      };
    } catch (parseError) {
      console.error('Error parsing character data:', parseError);
      console.error('Response text:', text);
      return { data: null, error: 'Failed to parse character data' };
    }
  } catch (error) {
    console.error('Error generating character details with Gemini:', error);
    return { data: null, error: 'Failed to generate character details' };
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
    voice: 'en-US-Neural2-J',
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

  // Merge provided config with defaults
  const ttsConfig: TTSConfig = {
    ...defaultTTSConfig,
    ...config,
    google: { ...defaultTTSConfig.google, ...(config.google || {}) },
    edge: { ...defaultTTSConfig.edge, ...(config.edge || {}) }
  };

  try {
    if (ttsConfig.provider === 'google') {
      if (!genAI) {
        return {
          data: null,
          error: 'Google TTS requires an API_KEY environment variable to be set',
          provider: 'google'
        };
      }
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
 * Convert text to speech using Google's TTS
 */
async function textToSpeechGoogle(
  text: string
): Promise<TTSResponse> {
  if (!text) return { data: null, error: 'No text provided', provider: 'google' };
  
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { data: null, error: 'Google TTS requires an API_KEY environment variable to be set', provider: 'google' };
    }
    
    // Use the standard Google Cloud Text-to-Speech API
    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    
    const requestBody = {
      input: {
        text: text
      },
      voice: {
        languageCode: 'en-US',  // Default language
        name: 'en-US-Standard-J',  // Default voice
        ssmlGender: 'NEUTRAL'  // Default gender
      },
      audioConfig: {
        audioEncoding: 'MP3',  // Output audio format
        speakingRate: 1.0,    // Normal speed
        pitch: 0.0,          // Normal pitch
        volumeGainDb: 0.0    // No volume gain
      }
    };

    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google TTS API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    const audioBase64 = responseData.audioContent;
    
    if (!audioBase64) {
      throw new Error('No audio content in response from Google TTS');
    }

    return { 
      data: `data:audio/mp3;base64,${audioBase64}`, 
      error: null,
      provider: 'google'
    };
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
    // Create a temporary file for the output
    const tempDir = os.tmpdir();
    const outputFile = path.join(tempDir, `tts-${Date.now()}.mp3`);

    try {
      // Use edge-tts to save the speech to a file
      await ttsSave(text, outputFile, {
        voice: config.edge?.voice || 'en-US-GuyNeural',
        rate: config.edge?.rate || '+0%',
        pitch: config.edge?.pitch || '+0Hz',
        volume: config.edge?.volume || '+0%',
      });

      // Read the generated audio file
      const audioBuffer = await fs.readFile(outputFile);
      
      // Convert to base64
      const base64Audio = audioBuffer.toString('base64');
      
      // Return the audio data with the appropriate MIME type
      return {
        data: `data:audio/mp3;base64,${base64Audio}`,
        error: null,
        provider: 'edge'
      };
    } catch (error: any) {
      console.error('Error in edge-tts service:', error);
      return {
        data: null,
        error: `Edge TTS error: ${error.message}`,
        provider: 'edge'
      };
    } finally {
      // Clean up the temporary file
      try {
        await fs.unlink(outputFile).catch(() => {});
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error: any) {
    console.error('Unexpected error in edge-tts service:', error);
    return {
      data: null,
      error: `Unexpected error in edge-tts service: ${error.message}`,
      provider: 'edge'
    };
  }
}

export const evolveCharacter = async (
  character: PartialCharacter,
  prompt: string
): Promise<CharacterResponse> => {
  try {
    const evolutionPrompt = `Given the following character and the user's evolution prompt, generate an updated character profile.\n\nCurrent Character: ${JSON.stringify(character)}\n\nEvolution Prompt: ${prompt}`;
    
    const result = await textModel.generateContent(evolutionPrompt);
    const response = await result.response;
    
    if (!response.text) {
      return { data: null, error: 'No response text from Gemini' };
    }
    
    const text = response.text();
    
    try {
      const updatedData = JSON.parse(text) as PartialCharacter;
      return { data: updatedData, error: null };
    } catch (parseError) {
      console.error('Error parsing evolution data:', parseError);
      return { data: null, error: 'Failed to parse evolution data' };
    }
  } catch (error) {
    console.error('Error evolving character with Gemini:', error);
    return { data: null, error: 'Failed to evolve character' };
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
    // Generate a portrait description for the character
    const descriptionPrompt = `Generate a detailed visual description for a character portrait based on the following traits. Focus on visual details like appearance, clothing, and expression. Be concise but vivid.\n\n${JSON.stringify(character)}`;
    
    // Get a detailed description of the portrait
    const descriptionResult = await textModel.generateContent(descriptionPrompt);
    const descriptionResponse = await descriptionResult.response;
    const description = descriptionResponse.text();
    
    // Generate the image using the description
    const imagePrompt = `${description}\n\nGenerate a portrait image based on this description.`;
    const imageResult = await imageModel.generateContent(imagePrompt);
    const imageResponse = await imageResult.response;
    
    // Check if there is a candidate with content
    if (!imageResponse.candidates || imageResponse.candidates.length === 0 || !imageResponse.candidates[0].content) {
      return { data: null, error: 'No image candidate in response' };
    }
    
    // Extract the base64 string from the first part's inline data
    const parts = imageResponse.candidates[0].content.parts;
    if (!parts || parts.length === 0 || !parts[0].inlineData) {
      return { data: null, error: 'No image data in response' };
    }
    
    const imageBase64 = parts[0].inlineData.data;
    const mimeType = parts[0].inlineData.mimeType || 'image/jpeg';
    
    return { data: `data:${mimeType};base64,${imageBase64}`, error: null };
  } catch (error) {
    console.error('Error generating portrait with Gemini:', error);
    return { data: null, error: 'Failed to generate portrait' };
  }
};
