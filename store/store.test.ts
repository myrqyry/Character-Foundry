import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from './index';
import { Character, Genre } from '../types';

// Helper function to create a test character
const createTestCharacter = (overrides: Partial<Character> = {}): Character => ({
  id: 'test-id',
  name: 'Test Character',
  title: 'Test Title',
  synopsis: 'Test synopsis',
  personality: 'Test personality',
  flaws: 'Test flaws',
  strengths: 'Test strengths',
  appearance: 'Test appearance',
  backstory: 'Test backstory',
  portraitBase64: null,
  voiceSampleBase64: null,
  genre: 'High Fantasy',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentVersion: 1,
  versions: [],
  ...overrides
});

describe('Character Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCharacterStore.setState({
      characters: [],
      currentView: 0,
      editingCharacterId: null,
      genres: ['High Fantasy', 'Cyberpunk', 'Post-Apocalyptic', 'Slice of Life', 'Mythic', 'Historical Fiction']
    });
  });

  it('should add a character', () => {
    const store = useCharacterStore.getState();
    const characterData = {
      name: 'New Character',
      title: 'New Title',
      synopsis: 'New synopsis',
      personality: 'New personality',
      flaws: 'New flaws',
      strengths: 'New strengths',
      appearance: 'New appearance',
      backstory: 'New backstory',
      portraitBase64: null,
      voiceSampleBase64: null,
      genre: 'Cyberpunk' as Genre
    };

    store.addCharacter(characterData);
    
    const state = useCharacterStore.getState();
    expect(state.characters).toHaveLength(1);
    expect(state.characters[0].name).toBe('New Character');
    expect(state.characters[0].currentVersion).toBe(1);
  });

  it('should update a character', () => {
    const store = useCharacterStore.getState();
    const character = createTestCharacter();
    
    // Add the character first
    store.characters = [character];
    
    // Update the character
    const updatedCharacter = store.updateCharacter(character.id, {
      name: 'Updated Name',
      title: 'Updated Title'
    });
    
    expect(updatedCharacter).not.toBeNull();
    expect(updatedCharacter?.name).toBe('Updated Name');
    expect(updatedCharacter?.title).toBe('Updated Title');
    expect(updatedCharacter?.currentVersion).toBe(2);
    
    // Check that a version was created
    const state = useCharacterStore.getState();
    const updatedChar = state.characters.find(c => c.id === character.id);
    expect(updatedChar?.versions).toHaveLength(1);
    expect(updatedChar?.versions[0].version).toBe(1);
  });

  it('should delete a character', () => {
    const store = useCharacterStore.getState();
    const character = createTestCharacter();
    
    // Add the character first
    store.characters = [character];
    
    // Delete the character
    store.deleteCharacter(character.id);
    
    const state = useCharacterStore.getState();
    expect(state.characters).toHaveLength(0);
  });

  it('should get character versions', () => {
    const store = useCharacterStore.getState();
    const character = createTestCharacter({
      currentVersion: 3,
      versions: [
        { 
          name: 'Test Character',
          title: 'Test Title',
          synopsis: 'Test synopsis',
          personality: 'Test personality',
          flaws: 'Test flaws',
          strengths: 'Test strengths',
          appearance: 'Test appearance',
          backstory: 'Test backstory',
          portraitBase64: null,
          voiceSampleBase64: null,
          genre: 'High Fantasy',
          version: 1,
          updatedAt: new Date().toISOString(),
          changes: ['Initial version']
        },
        { 
          name: 'Test Character',
          title: 'Test Title',
          synopsis: 'Updated synopsis',
          personality: 'Test personality',
          flaws: 'Test flaws',
          strengths: 'Test strengths',
          appearance: 'Test appearance',
          backstory: 'Test backstory',
          portraitBase64: null,
          voiceSampleBase64: null,
          genre: 'High Fantasy',
          version: 2,
          updatedAt: new Date().toISOString(),
          changes: ['Updated synopsis']
        }
      ]
    });
    
    // Add the character first
    store.characters = [character];
    
    // Get versions
    const versions = store.getCharacterVersions(character.id);
    expect(versions).toHaveLength(3); // 2 versions + current version
    
    // Check that versions are sorted in descending order
    expect(versions[0].version).toBe(3); // Current version
    expect(versions[1].version).toBe(2);
    expect(versions[2].version).toBe(1);
    
    // Test getting a specific version
    const version1 = store.getCharacterVersion(character.id, 1);
    expect(version1).not.toBeNull();
    expect(version1?.version).toBe(1);
    
    const currentVersion = store.getCharacterVersion(character.id, 3);
    expect(currentVersion).not.toBeNull();
    expect(currentVersion?.version).toBe(3);
  });

  it('should restore a character version', () => {
    const store = useCharacterStore.getState();
    const character = createTestCharacter({
      currentVersion: 2,
      versions: [
        { 
          name: 'Old Name',
          title: 'Old Title',
          synopsis: 'Old synopsis',
          personality: 'Test personality',
          flaws: 'Test flaws',
          strengths: 'Test strengths',
          appearance: 'Test appearance',
          backstory: 'Test backstory',
          portraitBase64: null,
          voiceSampleBase64: null,
          genre: 'High Fantasy',
          version: 1,
          updatedAt: new Date().toISOString(),
          changes: ['Initial version']
        }
      ]
    });
    
    // Add the character first
    store.characters = [character];
    
    // Restore version 1
    const restoredCharacter = store.restoreCharacterVersion(character.id, 1);
    
    expect(restoredCharacter).not.toBeNull();
    expect(restoredCharacter?.name).toBe('Old Name');
    expect(restoredCharacter?.currentVersion).toBe(3); // Should increment version
    
    // Check that a new version was created
    const state = useCharacterStore.getState();
    const updatedChar = state.characters.find(c => c.id === character.id);
    expect(updatedChar?.versions).toHaveLength(2);
    expect(updatedChar?.versions[1].version).toBe(3);
    expect(updatedChar?.versions[1].changes).toContain('Restored from version 1');
  });

  it('should import characters', () => {
    const store = useCharacterStore.getState();
    
    // Add an existing character
    const existingChar = createTestCharacter({ id: 'existing-id', name: 'Existing Character' });
    store.characters = [existingChar];
    
    // Import new characters (one with existing ID, one new)
    const newChar1 = createTestCharacter({ id: 'existing-id', name: 'Updated Character' });
    const newChar2 = createTestCharacter({ id: 'new-id', name: 'New Character' });
    
    store.importCharacters([newChar1, newChar2]);
    
    const state = useCharacterStore.getState();
    expect(state.characters).toHaveLength(2); // Should not add duplicate ID
    
    // Existing character should not be updated
    expect(state.characters.find(c => c.id === 'existing-id')?.name).toBe('Existing Character');
    // New character should be added
    expect(state.characters.find(c => c.id === 'new-id')?.name).toBe('New Character');
  });
});
