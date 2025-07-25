
export type Genre = 'High Fantasy' | 'Cyberpunk' | 'Post-Apocalyptic' | 'Slice of Life' | 'Mythic' | 'Historical Fiction';

export interface CharacterVersion {
  name: string;
  title: string;
  synopsis: string;
  personality: string;
  flaws: string;
  strengths: string;
  appearance: string;
  backstory: string;
  portraitBase64: string | null;
  voiceSampleBase64: string | null;
  vocalDescription: string | null;
  genre?: Genre;
  version: number;
  updatedAt: string;
  changes?: string[];
}

export interface Character {
  id: string;
  name: string;
  title: string;
  synopsis: string;
  personality: string;
  flaws: string;
  strengths: string;
  appearance: string;
  backstory: string;
  portraitBase64: string | null;
  voiceSampleBase64: string | null;
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
  versions: CharacterVersion[];
  genre?: Genre;
}

export type PartialCharacter = Omit<Character, 'id' | 'createdAt'>;

export enum View {
  Dashboard,
  Editor,
}
