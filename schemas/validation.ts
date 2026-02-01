import { z } from 'zod';

// Genre validation
export const GenreSchema = z.enum([
  'High Fantasy',
  'Cyberpunk',
  'Post-Apocalyptic',
  'Slice of Life',
  'Mythic',
  'Historical Fiction'
]);

// Character Version schema
export const CharacterVersionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  synopsis: z.string().optional(),
  personality: z.string().optional(),
  flaws: z.string().optional(),
  strengths: z.string().optional(),
  appearance: z.string().optional(),
  backstory: z.string().optional(),
  portraitBase64: z.string().nullable().optional(),
  voiceSampleBase64: z.string().nullable().optional(),
  vocalDescription: z.string().nullable().optional(),
  genre: GenreSchema.optional(),
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
  changes: z.array(z.string()).optional()
});

// Character schema
export const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  synopsis: z.string().optional(),
  personality: z.string().optional(),
  flaws: z.string().optional(),
  strengths: z.string().optional(),
  appearance: z.string().optional(),
  backstory: z.string().optional(),
  portraitBase64: z.string().nullable().optional(),
  voiceSampleBase64: z.string().nullable().optional(),
  vocalDescription: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  currentVersion: z.number().int().positive(),
  versions: z.array(CharacterVersionSchema),
  genre: GenreSchema.optional()
});

// Partial character for updates
export const PartialCharacterSchema = CharacterSchema.partial().omit({
  id: true,
  createdAt: true
});

// API Response schemas
export const CharacterResponseSchema = z.object({
  data: CharacterSchema.nullable(),
  error: z.string().nullable()
});

export const ImageResponseSchema = z.object({
  data: z.string().nullable(),
  error: z.string().nullable()
});

export const TTSResponseSchema = z.object({
  data: z.string().nullable(),
  error: z.string().nullable(),
  provider: z.enum(['google', 'edge'])
});

// Form schema for character editing
export const CharacterFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  synopsis: z.string().optional(),
  personality: z.string().optional(),
  flaws: z.string().optional(),
  strengths: z.string().optional(),
  appearance: z.string().optional(),
  backstory: z.string().optional(),
  genre: GenreSchema.optional(),
  vocalDescription: z.string().nullable().optional(),
});