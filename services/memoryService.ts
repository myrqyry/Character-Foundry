const PROXY_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface MemorySearchResult {
  content: string;
  metadata: {
    character_id: string;
    version: number;
    updatedAt: string;
  };
  distance: number;
}

export const indexCharacterLore = async (character: any): Promise<{ message?: string; error?: string }> => {
  try {
    const response = await fetch(`${PROXY_BASE_URL}/api/memory/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to index lore');
    }
    
    return response.json();
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const searchCharacterLore = async (query: string, characterId?: string): Promise<{ results?: MemorySearchResult[]; error?: string }> => {
  try {
    const response = await fetch(`${PROXY_BASE_URL}/api/memory/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, character_id: characterId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search lore');
    }
    
    return response.json();
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
