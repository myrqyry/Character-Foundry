import { Character, CharacterVersion } from '../types';

const MAX_VERSIONS = 10; // Maximum number of versions to keep per character

// Helper function to detect changes between character versions
export function getChanges(oldChar: Character, updates: Partial<Character>): string[] {
  const changes: string[] = [];
  const fields: (keyof Character)[] = [
    'name', 'title', 'synopsis', 'personality', 'flaws',
    'strengths', 'appearance', 'backstory', 'genre', 'vocalDescription'
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

  if ('vocalDescription' in updates && updates.vocalDescription !== oldChar.vocalDescription) {
    changes.push('Updated vocal description');
  }

  return changes.length > 0 ? changes : ['No specific changes detected'];
}

// Create a new version from current character state
export function createVersionFromCharacter(char: Character, changes: string[]): CharacterVersion {
  const { id, createdAt, currentVersion, versions, ...charData } = char;
  return {
    ...charData,
    vocalDescription: char.vocalDescription || null,
    version: char.currentVersion + 1,
    updatedAt: new Date().toISOString(),
    changes
  };
}

// Create updated character with new version
export function updateCharacterWithVersion(
  char: Character,
  updates: Partial<Character>,
  changes: string[]
): Character {
  const now = new Date().toISOString();
  const newVersion: CharacterVersion = {
    ...char,
    ...updates,
    vocalDescription: updates.vocalDescription ?? char.vocalDescription,
    version: char.currentVersion + 1,
    updatedAt: now,
    changes
  };

  return {
    ...char,
    ...updates,
    updatedAt: now,
    currentVersion: char.currentVersion + 1,
    versions: [
      ...(char.versions || []).slice(-(MAX_VERSIONS - 1)),
      newVersion
    ]
  };
}

// Restore character to a specific version
export function restoreCharacterVersion(
  char: Character,
  versionToRestore: CharacterVersion
): Character {
  const now = new Date().toISOString();
  const restoredCharacter: Character = {
    ...char,
    ...versionToRestore,
    updatedAt: now,
    currentVersion: char.currentVersion + 1,
    versions: [
      ...(char.versions || []).slice(-(MAX_VERSIONS - 1)),
      {
        ...versionToRestore,
        vocalDescription: versionToRestore.vocalDescription || null,
        version: char.currentVersion + 1,
        updatedAt: now,
        changes: [`Restored from version ${versionToRestore.version}`]
      }
    ]
  };

  return restoredCharacter;
}