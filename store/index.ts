import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { Character, Genre, View, CharacterVersion } from '../types';
import { getChanges, createVersionFromCharacter, updateCharacterWithVersion, restoreCharacterVersion } from './versioning';

interface StoreState {
  characters: Character[];
  currentView: View;
  editingCharacterId: string | null;
  genres: Genre[];

  addCharacter: (characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>) => Character;
  updateCharacter: (id: string, updates: Partial<Character>) => Character | null;
  deleteCharacter: (id: string) => void;
  setCurrentView: (view: View) => void;
  setEditingCharacterId: (id: string | null) => void;
  importCharacters: (newCharacters: Character | Character[]) => void;
  getCharacterVersion: (characterId: string, version: number) => CharacterVersion | null;
  getCharacterVersions: (characterId: string) => CharacterVersion[];
  restoreCharacterVersion: (characterId: string, version: number) => Character | null;
}

export const useCharacterStore = create<StoreState>()(
  persist(
    (set, get) => ({
      characters: [],
      currentView: View.Dashboard,
      editingCharacterId: null,
      genres: ['High Fantasy', 'Cyberpunk', 'Post-Apocalyptic', 'Slice of Life', 'Mythic', 'Historical Fiction'],

      addCharacter: (characterData) => {
        const newCharacter: Character = {
          ...characterData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentVersion: 1,
          versions: []
        };

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
          const existingIds = new Set(state.characters.map((c) => c.id));
          const toAdd = charactersArray.filter((c) => !existingIds.has(c.id));
          if (toAdd.length === 0) return state;
          return {
            characters: [...state.characters, ...toAdd],
          };
        });
      },

      getCharacterVersion: (characterId: string, version: number) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return null;

        if (version === character.currentVersion) {
          return createVersionFromCharacter(character, ['Current version']);
        }

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
          return character;
        }

        const versionToRestore = character.versions?.find(v => v.version === version) || null;
        if (!versionToRestore) return null;

        const restoredCharacter = restoreCharacterVersion(character, versionToRestore);

        set((state) => ({
          characters: state.characters.map(c =>
            c.id === characterId ? restoredCharacter : c
          )
        }));

        return restoredCharacter;
      },
    }),
    {
      name: 'character-storage',
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
      partialize: (state) => ({
        characters: state.characters,
        genres: state.genres,
        currentView: state.currentView,
        editingCharacterId: state.editingCharacterId,
      })
    }
  )
);

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
  }))
);
