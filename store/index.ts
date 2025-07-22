import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Character, Genre, View } from '../types';

interface CharacterState {
  characters: Character[];
  currentView: View;
  editingCharacterId: string | null;
  genres: Genre[];
  actions: {
    addCharacter: (character: Character) => void;
    updateCharacter: (character: Character) => void;
    deleteCharacter: (id: string) => void;
    setCurrentView: (view: View) => void;
    setEditingCharacterId: (id: string | null) => void;
    importCharacters: (characters: Character[]) => void;
  };
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      characters: [],
      currentView: View.Dashboard,
      editingCharacterId: null,
      genres: ['High Fantasy', 'Cyberpunk', 'Post-Apocalyptic', 'Slice of Life', 'Mythic', 'Historical Fiction'],
      actions: {
        addCharacter: (character) =>
          set((state) => ({
            characters: [...state.characters, character].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
          })),
        updateCharacter: (character) =>
          set((state) => ({
            characters: state.characters.map((c) =>
              c.id === character.id ? character : c
            ),
          })),
        deleteCharacter: (id) =>
          set((state) => ({
            characters: state.characters.filter((c) => c.id !== id),
          })),
        setCurrentView: (view) => set({ currentView: view }),
        setEditingCharacterId: (id) => set({ editingCharacterId: id }),
        importCharacters: (newCharacters) =>
          set((state) => {
            const existingIds = new Set(state.characters.map((c) => c.id));
            const uniqueNewCharacters = newCharacters.filter((c) => !existingIds.has(c.id));
            return {
              characters: [...state.characters, ...uniqueNewCharacters].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ),
            };
          }),
      },
    }),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ characters, genres }) => ({ characters, genres }),
    }
  )
);

export const useStoreActions = () => useCharacterStore((state) => state.actions);
