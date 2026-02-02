import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Character, Genre, View, CharacterVersion } from '../types';
import { getChanges, createVersionFromCharacter, updateCharacterWithVersion, restoreCharacterVersion } from './versioning';

// Define the store state and actions
type StoreState = {
  // State
  characters: Character[];
  currentView: View;
  editingCharacterId: string | null;
  genres: Genre[];
  ttsProvider: 'google' | 'edge';
  googleTtsVoice: string;
  edgeTtsVoice: string;
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
  setTtsProvider: (provider: 'google' | 'edge') => void;
  setGoogleTtsVoice: (voice: string) => void;
  setEdgeTtsVoice: (voice: string) => void;
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
      googleTtsVoice: 'gemini-2.5-flash-tts', // Default Google TTS voice
      edgeTtsVoice: 'en-US-GuyNeural', // Default Edge TTS voice
      textModel: 'gemini-3-flash-preview', // Default text model
      imageModel: 'gemini-2.5-flash-image', // Default image model

      // Actions
      addCharacter: (characterData) => {
        const newCharacter: Character = {
          ...characterData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentVersion: 1,
          versions: []
        };

        set((state) => ({
          characters: [...state.characters, newCharacter].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
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
        set((state) => ({
          characters: [
            ...state.characters,
            ...charactersArray.filter(
              (newChar) => !state.characters.some((char) => char.id === newChar.id)
            ),
          ],
        }));
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

      setTtsProvider: (provider: 'google' | 'edge') => set({ ttsProvider: provider }),
      setGoogleTtsVoice: (voice: string) => set({ googleTtsVoice: voice }),
      setEdgeTtsVoice: (voice: string) => set({ edgeTtsVoice: voice }),
      setTextModel: (model: string) => set({ textModel: model }),
      setImageModel: (model: string) => set({ imageModel: model }),
    }),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        characters: state.characters,
        genres: state.genres,
        currentView: state.currentView,
        editingCharacterId: state.editingCharacterId,
        ttsProvider: state.ttsProvider,
        googleTtsVoice: state.googleTtsVoice,
        edgeTtsVoice: state.edgeTtsVoice,
        textModel: state.textModel,
        imageModel: state.imageModel,
      })
    }
  )
);

// Create a hook that provides actions separately from state
export const useCharacterActions = () => useCharacterStore(
  (state) => ({
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
    setTextModel: state.setTextModel,
    setImageModel: state.setImageModel,
  })
);
