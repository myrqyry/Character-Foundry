import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCharacterStore } from '../store';
import {
  fleshOutCharacter,
  generatePortrait,
  generateVocalDescription,
  evolveCharacter,
  textToSpeech
} from '../services/geminiService';
import { PartialCharacter } from '../types';
import toast from 'react-hot-toast';

// Query keys
export const characterKeys = {
  all: ['characters'] as const,
  lists: () => [...characterKeys.all, 'list'] as const,
  list: (filters: string) => [...characterKeys.lists(), { filters }] as const,
  details: () => [...characterKeys.all, 'detail'] as const,
  detail: (id: string) => [...characterKeys.details(), id] as const,
};

// Flesh out character mutation
export const useFleshOutCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (character: PartialCharacter) => fleshOutCharacter(character),
    onSuccess: (result) => {
      if (result.data) {
        // Invalidate and refetch character data if needed
        queryClient.invalidateQueries({ queryKey: characterKeys.all });
        toast.success('Character fleshed out successfully!');
      } else if (result.error) {
        toast.error(`Failed to flesh out character: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error fleshing out character:', error);
      toast.error('Failed to flesh out character');
    },
  });
};

// Generate portrait mutation
export const useGeneratePortrait = () => {
  return useMutation({
    mutationFn: (character: PartialCharacter) => generatePortrait(character),
    onSuccess: (result) => {
      if (result.data) {
        toast.success('Portrait generated successfully!');
      } else if (result.error) {
        toast.error(`Failed to generate portrait: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error generating portrait:', error);
      toast.error('Failed to generate portrait');
    },
  });
};

// Generate vocal description mutation
export const useGenerateVocalDescription = () => {
  return useMutation({
    mutationFn: (base64Audio: string) => generateVocalDescription(base64Audio),
    onSuccess: (result) => {
      if (result.data) {
        toast.success('Vocal description generated successfully!');
      } else if (result.error) {
        toast.error(`Failed to generate vocal description: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error generating vocal description:', error);
      toast.error('Failed to generate vocal description');
    },
  });
};

// Evolve character mutation
export const useEvolveCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ character, prompt }: { character: PartialCharacter; prompt: string }) =>
      evolveCharacter(character, prompt),
    onSuccess: (result) => {
      if (result.data) {
        queryClient.invalidateQueries({ queryKey: characterKeys.all });
        toast.success('Character evolved successfully!');
      } else if (result.error) {
        toast.error(`Failed to evolve character: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error evolving character:', error);
      toast.error('Failed to evolve character');
    },
  });
};

// Add character mutation
export const useAddCharacter = () => {
  const queryClient = useQueryClient();
  const { addCharacter } = useCharacterStore();

  return useMutation({
    mutationFn: (characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>) =>
      Promise.resolve(addCharacter(characterData)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: characterKeys.all });
      toast.success('Character created successfully!');
    },
    onError: (error) => {
      console.error('Error adding character:', error);
      toast.error('Failed to create character');
    },
  });
};

// Update character mutation
export const useUpdateCharacter = () => {
  const queryClient = useQueryClient();
  const { updateCharacter } = useCharacterStore();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Character> }) =>
      Promise.resolve(updateCharacter(id, updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: characterKeys.all });
      toast.success('Character updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating character:', error);
      toast.error('Failed to update character');
    },
  });
};

// Delete character mutation
export const useDeleteCharacter = () => {
  const queryClient = useQueryClient();
  const { deleteCharacter } = useCharacterStore();

  return useMutation({
    mutationFn: (id: string) => Promise.resolve(deleteCharacter(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: characterKeys.all });
      toast.success('Character deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting character:', error);
      toast.error('Failed to delete character');
    },
  });
};