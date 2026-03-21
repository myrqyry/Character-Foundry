import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TTSProvider = 'google' | 'edge' | 'qwen';

interface SettingsState {
  ttsProvider: TTSProvider;
  googleTtsVoice: string;
  edgeTtsVoice: string;
  edgeTtsStyle: string;
  edgeTtsRole: string;
  edgeTtsRate: string;
  edgeTtsPitch: string;
  edgeTtsVolume: string;
  textModel: string;
  imageModel: string;

  setTtsProvider: (provider: TTSProvider) => void;
  setGoogleTtsVoice: (voice: string) => void;
  setEdgeTtsVoice: (voice: string) => void;
  setEdgeTtsStyle: (v: string) => void;
  setEdgeTtsRole: (v: string) => void;
  setEdgeTtsRate: (v: string) => void;
  setEdgeTtsPitch: (v: string) => void;
  setEdgeTtsVolume: (v: string) => void;
  setTextModel: (model: string) => void;
  setImageModel: (model: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ttsProvider: 'google',
      googleTtsVoice: 'Kore',
      edgeTtsVoice: 'en-US-GuyNeural',
      edgeTtsStyle: 'default',
      edgeTtsRole: 'default',
      edgeTtsRate: '+0%',
      edgeTtsPitch: '+0Hz',
      edgeTtsVolume: '+0%',
      textModel: 'gemini-3-flash-preview',
      imageModel: 'gemini-3.1-flash-image-preview',

      setTtsProvider: (provider) => set({ ttsProvider: provider }),
      setGoogleTtsVoice: (voice) => set({ googleTtsVoice: voice }),
      setEdgeTtsVoice: (voice) => set({ edgeTtsVoice: voice }),
      setEdgeTtsStyle: (v) => set({ edgeTtsStyle: v }),
      setEdgeTtsRole: (v) => set({ edgeTtsRole: v }),
      setEdgeTtsRate: (v) => set({ edgeTtsRate: v }),
      setEdgeTtsPitch: (v) => set({ edgeTtsPitch: v }),
      setEdgeTtsVolume: (v) => set({ edgeTtsVolume: v }),
      setTextModel: (model) => set({ textModel: model }),
      setImageModel: (model) => set({ imageModel: model }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
          const memoryStorage: Record<string, string> = {};
          return {
            getItem: (key: string) => memoryStorage[key] ?? null,
            setItem: (key: string, value: string) => { memoryStorage[key] = value; },
            removeItem: (key: string) => { delete memoryStorage[key]; },
          };
        }
        return window.localStorage;
      }),
    }
  )
);
