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

// Text to speech mutation
export const useTextToSpeech = () => {
  return useMutation({
    mutationFn: ({ text, config }: { text: string; config?: any }) =>
      textToSpeech(text, config),
    onSuccess: (result) => {
      if (result.data) {
        toast.success('Audio generated successfully!');
      } else if (result.error) {
        toast.error(`Failed to generate audio: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio');
    },
  });
};