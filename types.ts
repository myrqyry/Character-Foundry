
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
}

export type PartialCharacter = Omit<Character, 'id' | 'createdAt'>;

export enum View {
  Dashboard,
  Editor,
}
