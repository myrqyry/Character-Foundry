import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fleshOutCharacter, generatePortrait, generateVocalDescription, textToSpeech, evolveCharacter } from './geminiService';
import { useSettingsStore } from '../store/settings';
import { Character, Genre } from '../types';

describe('geminiService', () => {
  beforeEach(() => {
    // Ensure store uses predictable models during tests
    useSettingsStore.setState({ 
        textModel: 'test-text-model',
        imageModel: 'test-image-model',
        ttsProvider: 'google'
    });

    // Reset fetch mock
    vi.restoreAllMocks();
  });

  const mockCharacter: Character = {
    id: '1',
    name: 'Test Character',
    title: 'Explorer',
    genre: 'High Fantasy' as Genre,
    synopsis: 'A test synopsis',
    personality: 'Curious',
    flaws: 'Impulsive',
    strengths: 'Brave',
    appearance: 'Tall',
    backstory: 'Grew up in a village',
    portraitBase64: null,
    voiceSampleBase64: null,
    voiceSampleTranscript: null,
    vocalDescription: null,
    currentVersion: 1,
    versions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('fleshOutCharacter', () => {
    it('should parse a valid JSON response from the API', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify({ name: 'TestChar', genre: 'Mythic' }) }],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const result = await fleshOutCharacter({ name: 'test' });

      expect(result.error).toBeNull();
      expect(result.data?.name).toBe('TestChar');
      expect(result.data?.genre).toBe('Mythic');

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should return an error when the API response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      } as any);

      const result = await fleshOutCharacter({ name: 'test' });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('generatePortrait', () => {
    it('should generate a portrait successfully', async () => {
      // First fetch is for description, second for image
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'A description' }] } }]
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ imageData: 'base64data' }),
        });

      const result = await generatePortrait({ name: 'test' });

      expect(result.error).toBeNull();
      expect(result.data).toBe('data:image/png;base64,base64data');
    });

    it('first generates a visual description', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ candidates: [{ content: { parts: [{ text: 'desc' }] } }] })
        });

        await generatePortrait(mockCharacter);
    
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/gemini/generate'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('visual description'),
          })
        );
      });
  });

  describe('evolveCharacter', () => {
    it('incorporates current character and prompt', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ candidates: [{ content: { parts: [{ text: '{}' }] } }] })
        });

        const prompt = 'Add a scar';
        await evolveCharacter(mockCharacter, prompt);
    
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/gemini/generate'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('evolution'),
          })
        );
        const lastCall = (global.fetch as any).mock.calls[0];
        const body = lastCall[1].body;
        expect(body).toContain('Add a scar');
        expect(body).toContain('Test Character');
      });
  });

  describe('generateVocalDescription', () => {
    it('should generate a vocal description successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Deep voice' }] } }]
        }),
      });

      const result = await generateVocalDescription('data:audio/wav;base64,audio-data');

      expect(result.error).toBeNull();
      expect(result.data).toBe('Deep voice');
    });
  });

  describe('textToSpeech', () => {
    it('should generate speech with Google provider', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ audioContent: 'audio-data' }),
      });

      const result = await textToSpeech('Hello', { provider: 'google' });

      expect(result.error).toBeNull();
      expect(result.data).toBe('data:audio/mp3;base64,audio-data');
      expect(result.provider).toBe('google');
    });
  });
});
