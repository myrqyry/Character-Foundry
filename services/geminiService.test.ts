import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fleshOutCharacter } from './geminiService';
import { useCharacterStore } from '../store';

describe('geminiService', () => {
  beforeEach(() => {
    // Ensure store uses a predictable text model during tests
    useCharacterStore.setState({ textModel: 'test-model' });

    // Reset fetch mock
    vi.restoreAllMocks();
  });

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
