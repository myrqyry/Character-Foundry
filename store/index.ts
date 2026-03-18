import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { Character, Genre, View, CharacterVersion } from '../types';
import { getChanges, createVersionFromCharacter, updateCharacterWithVersion, restoreCharacterVersion } from './versioning';

// Define the store state and actions
type StoreState = {
  // State
  characters: Character[];
  currentView: View;
  editingCharacterId: string | null;
  genres: Genre[];
  ttsProvider: 'google' | 'edge' | 'qwen';
  googleTtsVoice: string;
  edgeTtsVoice: string;
  edgeTtsStyle: string;
  edgeTtsRole: string;
  edgeTtsRate: string;
  edgeTtsPitch: string;
  edgeTtsVolume: string;
  textModel: string;
  imageModel: string;

  // Actions
  addCharacter: (characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>) => Character;
  updateCharacter: (id: string, updates: Partial<Character>) => Character | null;
  deleteCharacter: (id: string) => void;
  setCurrentView: (view: View) => void;
  setEditingCharacterId: (id: string | null) => void;
  importCharacters: (newCharacters: Character | Character[]) => void;
  getCharacterVersion: (characterId: string, version: number) => CharacterVersion | null;
  getCharacterVersions: (characterId: string) => CharacterVersion[];
  restoreCharacterVersion: (characterId: string, version: number) => Character | null;
  setTtsProvider: (provider: 'google' | 'edge' | 'qwen') => void;
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

// Create the store with separate state and actions
export const useCharacterStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      characters: [],
      currentView: View.Dashboard,
      editingCharacterId: null,
      genres: ['High Fantasy', 'Cyberpunk', 'Post-Apocalyptic', 'Slice of Life', 'Mythic', 'Historical Fiction'],
      ttsProvider: 'google', // Default TTS provider
      googleTtsVoice: 'Kore', // Default Google TTS voice
      edgeTtsVoice: 'en-US-GuyNeural', // Default Edge TTS voice
      edgeTtsStyle: 'default',
      edgeTtsRole: 'default',
      edgeTtsRate: '+0%',
      edgeTtsPitch: '+0Hz',
      edgeTtsVolume: '+0%',
      textModel: 'gemini-3-flash-preview', // Default text model
      imageModel: 'gemini-3.1-flash-image-preview', // Default image model

      // Actions
      addCharacter: (characterData) => {
        const newCharacter: Character = {
          ...characterData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentVersion: 1,
          versions: []
        };

        // New characters always have the most recent updatedAt, so prepend instead of sort.
        set((state) => ({
          characters: [newCharacter, ...state.characters]
        }));

        return newCharacter;
      },

      updateCharacter: (characterId: string, updates: Partial<Character>) => {
        let updatedChar: Character | null = null;

        set((state) => {
          const updatedCharacters = state.characters.map((char) => {
            if (char.id !== characterId) return char;

            const changes = getChanges(char, updates);
            updatedChar = updateCharacterWithVersion(char, updates, changes);
            return updatedChar;
          });

          return { characters: updatedCharacters };
        });

        return updatedChar;
      },

      deleteCharacter: (id: string) => {
        set((state) => ({
          characters: state.characters.filter((char) => char.id !== id)
        }));
      },

      setCurrentView: (view: View) => {
        set({ currentView: view });
      },

      setEditingCharacterId: (id: string | null) => {
        set({ editingCharacterId: id });
      },

      importCharacters: (newCharacters: Character | Character[]) => {
        const charactersArray = Array.isArray(newCharacters) ? newCharacters : [newCharacters];
        set((state) => {
          // Build a Set of existing IDs for O(1) duplicate detection instead of O(n×m).
          const existingIds = new Set(state.characters.map((c) => c.id));
          const toAdd = charactersArray.filter((c) => !existingIds.has(c.id));
          if (toAdd.length === 0) return state; // nothing to do
          return {
            characters: [...state.characters, ...toAdd],
          };
        });
      },

      getCharacterVersion: (characterId: string, version: number) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return null;

        if (version === character.currentVersion) {
          // For the current version, create a CharacterVersion from the character
          return createVersionFromCharacter(character, ['Current version']);
        }

        // For previous versions, find the matching version
        return character.versions?.find(v => v.version === version) || null;
      },

      getCharacterVersions: (characterId: string) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return [];

        const currentVersion = createVersionFromCharacter(character, ['Current version']);
        return [...(character.versions || []), currentVersion].sort((a, b) => b.version - a.version);
      },

      restoreCharacterVersion: (characterId: string, version: number) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return null;

        if (version === character.currentVersion) {
          // Already at this version
          return character;
        }

        const versionToRestore = character.versions?.find(v => v.version === version) || null;
        if (!versionToRestore) return null;

        const restoredCharacter = restoreCharacterVersion(character, versionToRestore);

        // Update the store
        set((state) => ({
          characters: state.characters.map(c =>
            c.id === characterId ? restoredCharacter : c
          )
        }));

        return restoredCharacter;
      },

      setTtsProvider: (provider: 'google' | 'edge' | 'qwen') => set({ ttsProvider: provider }),
      setGoogleTtsVoice: (voice: string) => set({ googleTtsVoice: voice }),
      setEdgeTtsVoice: (voice: string) => set({ edgeTtsVoice: voice }),
      setEdgeTtsStyle: (v: string) => set({ edgeTtsStyle: v }),
      setEdgeTtsRole: (v: string) => set({ edgeTtsRole: v }),
      setEdgeTtsRate: (v: string) => set({ edgeTtsRate: v }),
      setEdgeTtsPitch: (v: string) => set({ edgeTtsPitch: v }),
      setEdgeTtsVolume: (v: string) => set({ edgeTtsVolume: v }),
      setTextModel: (model: string) => set({ textModel: model }),
      setImageModel: (model: string) => set({ imageModel: model }),
    }),
    {
      name: 'character-storage',
      // Use safe storage to avoid errors in non-browser environments (Vitest, SSR, etc.).
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
          // Fallback to in-memory storage in environments without localStorage
          const memoryStorage: Record<string, string> = {};
          return {
            getItem: (key: string) => memoryStorage[key] ?? null,
            setItem: (key: string, value: string) => {
              memoryStorage[key] = value;
            },
            removeItem: (key: string) => {
              delete memoryStorage[key];
            },
          };
        }
        return window.localStorage;
      }),
      partialize: (state) => ({
        characters: state.characters,
        genres: state.genres,
        currentView: state.currentView,
        editingCharacterId: state.editingCharacterId,
        ttsProvider: state.ttsProvider,
        googleTtsVoice: state.googleTtsVoice,
        edgeTtsVoice: state.edgeTtsVoice,
        edgeTtsStyle: state.edgeTtsStyle,
        edgeTtsRole: state.edgeTtsRole,
        edgeTtsRate: state.edgeTtsRate,
        edgeTtsPitch: state.edgeTtsPitch,
        edgeTtsVolume: state.edgeTtsVolume,
        textModel: state.textModel,
        imageModel: state.imageModel,
      })
    }
  )
);

// Create a hook that provides actions separately from state.
// useShallow wraps the selector so that Zustand uses shallow equality on the returned object,
// preventing re-renders when the action function references haven't changed
// (Zustand action functions are stable, so this will almost never cause a re-render).
export const useCharacterActions = () => useCharacterStore(
  useShallow((state) => ({
    addCharacter: state.addCharacter,
    updateCharacter: state.updateCharacter,
    deleteCharacter: state.deleteCharacter,
    setCurrentView: state.setCurrentView,
    setEditingCharacterId: state.setEditingCharacterId,
    importCharacters: state.importCharacters,
    getCharacterVersion: state.getCharacterVersion,
    getCharacterVersions: state.getCharacterVersions,
    restoreCharacterVersion: state.restoreCharacterVersion,
    setTtsProvider: state.setTtsProvider,
    setGoogleTtsVoice: state.setGoogleTtsVoice,
    setEdgeTtsVoice: state.setEdgeTtsVoice,
    setEdgeTtsStyle: state.setEdgeTtsStyle,
    setEdgeTtsRole: state.setEdgeTtsRole,
    setEdgeTtsRate: state.setEdgeTtsRate,
    setEdgeTtsPitch: state.setEdgeTtsPitch,
    setEdgeTtsVolume: state.setEdgeTtsVolume,
    setTextModel: state.setTextModel,
    setImageModel: state.setImageModel,
  }))
);
