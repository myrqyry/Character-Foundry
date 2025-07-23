import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Character, Genre, View, CharacterVersion } from '../types';

const MAX_VERSIONS = 10; // Maximum number of versions to keep per character

// Helper function to detect changes between character versions
function getChanges(oldChar: Character, updates: Partial<Character>): string[] {
  const changes: string[] = [];
  const fields: (keyof Character)[] = [
    'name', 'title', 'synopsis', 'personality', 'flaws', 
    'strengths', 'appearance', 'backstory', 'genre'
  ];
  
  for (const field of fields) {
    if (field in updates && updates[field] !== oldChar[field]) {
      changes.push(`Updated ${field}`);
    }
  }
  
  if ('portraitBase64' in updates && updates.portraitBase64 !== oldChar.portraitBase64) {
    changes.push('Updated portrait');
  }
  
  if ('voiceSampleBase64' in updates && updates.voiceSampleBase64 !== oldChar.voiceSampleBase64) {
    changes.push('Updated voice sample');
  }
  
  return changes.length > 0 ? changes : ['No specific changes detected'];
}

// Define the store state and actions
type StoreState = {
  // State
  characters: Character[];
  currentView: View;
  editingCharacterId: string | null;
  genres: Genre[];
  
  // Actions
  addCharacter: (characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>) => Character;
  updateCharacter: (id: string, updates: Partial<Character>) => Character | null;
  deleteCharacter: (id: string) => void;
  setCurrentView: (view: View) => void;
  setEditingCharacterId: (id: string | null) => void;
  importCharacters: (newCharacters: Character[]) => void;
  getCharacterVersion: (characterId: string, version: number) => CharacterVersion | null;
  getCharacterVersions: (characterId: string) => CharacterVersion[];
  restoreCharacterVersion: (characterId: string, version: number) => Character | null;
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
      
      // Actions
      addCharacter: (characterData) => {
        const now = new Date().toISOString();
        const newCharacter: Character = {
          ...characterData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
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
        const now = new Date().toISOString();
        let updatedChar: Character | null = null;
        
        set((state) => {
          const updatedCharacters = state.characters.map((char) => {
            if (char.id !== characterId) return char;
            
            const changes = getChanges(char, updates);
            
            // Create a new version with the current state before updates
            const { id, createdAt, currentVersion, versions, ...charData } = char;
            const newVersion: CharacterVersion = {
              ...charData,
              version: char.currentVersion,
              updatedAt: now,
              changes
            };
            
            // Create the updated character
            updatedChar = {
              ...char,
              ...updates,
              updatedAt: now,
              currentVersion: char.currentVersion + 1,
              versions: [
                ...(char.versions || []).slice(-(MAX_VERSIONS - 1)),
                newVersion
              ]
            };
            
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
      
      importCharacters: (newCharacters: Character[]) => {
        set((state) => {
          const existingIds = new Set(state.characters.map(c => c.id));
          const uniqueNewCharacters = newCharacters.filter(c => !existingIds.has(c.id));
          
          return {
            characters: [...state.characters, ...uniqueNewCharacters].sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )
          };
        });
      },
      
      getCharacterVersion: (characterId: string, version: number) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return null;
        
        if (version === character.currentVersion) {
          // For the current version, create a CharacterVersion from the character
          const { id, createdAt, currentVersion, versions, ...currentState } = character;
          const versionData: CharacterVersion = {
            ...currentState,
            version: currentVersion,
            updatedAt: character.updatedAt,
            changes: ['Current version']
          };
          return versionData;
        }
        
        // For previous versions, find the matching version
        return character.versions?.find(v => v.version === version) || null;
      },
      
      getCharacterVersions: (characterId: string) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return [];
        
        const currentVersion: CharacterVersion = (() => {
          const { id, currentVersion, versions, ...currentState } = character;
          return {
            ...currentState,
            version: currentVersion,
            updatedAt: character.updatedAt,
            changes: ['Current version']
          };
        })();
        
        return [...(character.versions || []), currentVersion].sort((a, b) => b.version - a.version);
      },
      
      restoreCharacterVersion: (characterId: string, version: number) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return null;
        
        let versionToRestore: CharacterVersion | null = null;
        
        if (version === character.currentVersion) {
          // Already at this version
          return character;
        }
        
        versionToRestore = character.versions?.find(v => v.version === version) || null;
        if (!versionToRestore) return null;
        
        // Create a new version with the restored state
        const now = new Date().toISOString();
        const restoredCharacter: Character = {
          ...character,
          ...versionToRestore,
          updatedAt: now,
          currentVersion: character.currentVersion + 1,
          versions: [
            ...(character.versions || []).slice(-(MAX_VERSIONS - 1)),
            {
              ...versionToRestore,
              version: character.currentVersion + 1,
              updatedAt: now,
              changes: [`Restored from version ${version}`]
            }
          ]
        };
        
        // Update the store
        set((state) => ({
          characters: state.characters.map(c => 
            c.id === characterId ? restoredCharacter : c
          )
        }));
        
        return restoredCharacter;
      }
    }),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        characters: state.characters,
        genres: state.genres,
        currentView: state.currentView,
        editingCharacterId: state.editingCharacterId
      })
    }
  )
);

// Create a hook that provides actions separately from state
export const useCharacterActions = () => {
  return useCharacterStore(
    (state) => ({
      addCharacter: state.addCharacter,
      updateCharacter: state.updateCharacter,
      deleteCharacter: state.deleteCharacter,
      setCurrentView: state.setCurrentView,
      setEditingCharacterId: state.setEditingCharacterId,
      importCharacters: state.importCharacters,
      getCharacterVersion: state.getCharacterVersion,
      getCharacterVersions: state.getCharacterVersions,
      restoreCharacterVersion: state.restoreCharacterVersion
    })
  );
};
