import { useCharacterStore } from '../store';
import { useSettingsStore } from '../store/settings';

const PROXY_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export type TTSProvider = 'google' | 'edge' | 'qwen';

export interface TTSConfig {
  provider: TTSProvider;
  google?: {
    voice?: string;
    languageCode?: string;
    speakingRate?: number;
    pitch?: number;
  };
  edge?: {
    voice?: string;
    rate?: string;
    pitch?: string;
    volume?: string;
  };
  qwen?: {
    ref_audio?: string;
    ref_text?: string;
    language?: string;
  };
}

interface TTSResponse {
  data: string | null;
  error: string | null;
  provider: TTSProvider;
}

const defaultTTSConfig: TTSConfig = {
  provider: 'google',
  google: { voice: 'Kore', languageCode: 'en-US', speakingRate: 1.0, pitch: 0.0 },
  edge: { voice: 'en-US-GuyNeural', rate: '+0%', pitch: '+0Hz', volume: '+0%' },
  qwen: { language: 'English' },
};

async function callTTSAPI(
  endpoint: string,
  body: Record<string, unknown>,
  provider: TTSProvider,
  mimeType: string,
): Promise<TTSResponse> {
  const response = await fetch(`${PROXY_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const responseData = await response.json();
  const audioBase64: string | undefined = responseData.audioContent;

  if (!audioBase64) {
    return { data: null, error: `No audio content in response from ${provider} TTS`, provider };
  }

  return { data: `data:${mimeType};base64,${audioBase64}`, error: null, provider };
}

async function textToSpeechGoogle(text: string, config: TTSConfig): Promise<TTSResponse> {
  if (!text) return { data: null, error: 'No text provided', provider: 'google' };
  try {
    return callTTSAPI('/api/tts/google', { text, voice_name: config.google?.voice || 'Kore' }, 'google', 'audio/mp3');
  } catch (error) {
    console.error('Error in Google TTS service:', error);
    throw error;
  }
}

async function textToSpeechEdge(text: string, config: TTSConfig): Promise<TTSResponse> {
  if (!text) return { data: null, error: 'No text provided', provider: 'edge' };
  try {
    return callTTSAPI('/api/tts/edge', {
      text,
      voice: config.edge?.voice || 'en-US-GuyNeural',
      rate: config.edge?.rate || '+0%',
      pitch: config.edge?.pitch || '+0Hz',
      volume: config.edge?.volume || '+0%',
    }, 'edge', 'audio/mp3');
  } catch (error) {
    console.error('Error in Edge TTS service:', error);
    throw error;
  }
}

async function textToSpeechQwen(text: string, config: TTSConfig): Promise<TTSResponse> {
  if (!text) return { data: null, error: 'No text provided', provider: 'qwen' };
  if (!config.qwen?.ref_audio || !config.qwen?.ref_text) {
    return { data: null, error: 'Reference audio and transcript are required for voice cloning', provider: 'qwen' };
  }
  try {
    return callTTSAPI('/api/tts/qwen', {
      text,
      ref_audio: config.qwen.ref_audio,
      ref_text: config.qwen.ref_text,
      language: config.qwen.language || 'English',
    }, 'qwen', 'audio/wav');
  } catch (error) {
    console.error('Error in Qwen TTS service:', error);
    throw error;
  }
}

export const textToSpeech = async (
  text: string,
  config: Partial<TTSConfig> = {},
): Promise<TTSResponse> => {
  if (!text) {
    return { data: null, error: 'No text provided', provider: config.provider || defaultTTSConfig.provider };
  }

  const { ttsProvider, googleTtsVoice, edgeTtsVoice } = useSettingsStore.getState();
  const { characters, editingCharacterId } = useCharacterStore.getState();
  const editingCharacter = characters.find(c => c.id === editingCharacterId);

  const ttsConfig: TTSConfig = {
    provider: config.provider || ttsProvider,
    google: { ...defaultTTSConfig.google, voice: googleTtsVoice, ...(config.google || {}) },
    edge: { ...defaultTTSConfig.edge, voice: edgeTtsVoice, ...(config.edge || {}) },
    qwen: {
      ...defaultTTSConfig.qwen,
      ref_audio: editingCharacter?.voiceSampleBase64 || undefined,
      ref_text: editingCharacter?.voiceSampleTranscript || undefined,
      ...(config.qwen || {})
    }
  };

  try {
    const providerFn = { google: textToSpeechGoogle, edge: textToSpeechEdge, qwen: textToSpeechQwen }[ttsConfig.provider];
    if (!providerFn) throw new Error(`Unsupported TTS provider: ${ttsConfig.provider}`);
    return providerFn(text, ttsConfig);
  } catch (error) {
    console.error(`Error with ${ttsConfig.provider} TTS service:`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate speech',
      provider: ttsConfig.provider
    };
  }
};
