import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Character, CharacterVersion, Genre, PartialCharacter } from '../types';
import Button from './Button';
import { ArrowLeftIcon, SparklesIcon, TrashIcon } from './Icons';
import { useFleshOutCharacter, useGeneratePortrait, useGenerateVocalDescription, useEvolveCharacter, useAddCharacter, useUpdateCharacter, useDeleteCharacter } from '../hooks/useAI';
import { useCharacterStore } from '../store';
import ImportExportMenu from './ImportExportMenu';
import PortraitManager from './PortraitManager';
import VoiceManager from './VoiceManager';
import CharacterFields from './CharacterFields';
import { CharacterFormSchema } from '../schemas/validation';

interface CharacterFormProps {
  initialCharacter: Character | null;
  onBack: () => void;
}

export const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
    <input id={id} {...props} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
  </div>
);

import PlayButton from './PlayButton'; // No-op change to trigger rebuild

export const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  onPlay?: () => void;
  isPlaying?: boolean;
}> = ({ label, id, onPlay, isPlaying, ...props }) => (
  <div className="relative">
    <label htmlFor={id} className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
    <textarea id={id} {...props} rows={5} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
    {onPlay && (
      <PlayButton onClick={onPlay} isPlaying={!!isPlaying} />
    )}
  </div>
);

const CharacterForm: React.FC<CharacterFormProps> = ({ initialCharacter, onBack }) => {
  // Destructure props with defaults to avoid undefined errors
  const safeInitialCharacter = initialCharacter || {};
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [prompt, setPrompt] = useState('');
  const [showAudioModal, setShowAudioModal] = useState(false);
  const { genres } = useCharacterStore();
  const fleshOutMutation = useFleshOutCharacter();
  const generatePortraitMutation = useGeneratePortrait();
  const generateVocalDescriptionMutation = useGenerateVocalDescription();
  const evolveCharacterMutation = useEvolveCharacter();
  const addCharacterMutation = useAddCharacter();
  const updateCharacterMutation = useUpdateCharacter();
  const deleteCharacterMutation = useDeleteCharacter();

  useEffect(() => {
    // Initialize character state when initialCharacter changes
    setCharacter(safeInitialCharacter);
  }, [safeInitialCharacter]);

  useEffect(() => {
    return () => {
      // Cleanup code if needed
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreChange = (genre: Genre) => {
    setCharacter(prev => ({ ...prev, genre }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setCharacter(prev => ({ ...prev, portraitBase64: base64String }));
        };
        reader.readAsDataURL(file);
      } else {
        // For audio, open the modal to allow clipping
        setShowAudioModal(true);
        // Store the file temporarily to pass to the iframe
        // This is a simplified approach; a more robust solution might use context or a global store
        (window as any).currentAudioFile = file; 
      }
    }
  };

  useEffect(() => {
    const handleAudioClipped = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setCharacter(prev => ({ ...prev, voiceSampleBase64: customEvent.detail }));
      setShowAudioModal(false);
    };

    window.addEventListener('audioClipped', handleAudioClipped);

    return () => {
      window.removeEventListener('audioClipped', handleAudioClipped);
    };
  }, []);

  const handleFleshOut = useCallback(async () => {
    fleshOutMutation.mutate(character as PartialCharacter, {
      onSuccess: (result) => {
        if (result.data) {
          setCharacter(prev => ({...prev, ...result.data}));
        }
      }
    });
  }, [character, fleshOutMutation]);

  const handleGeneratePortrait = useCallback(async () => {
    if (!character) return;
    
    generatePortraitMutation.mutate(character as PartialCharacter, {
      onSuccess: (result) => {
        if (result.data) {
          setCharacter(prev => ({ ...prev, portraitBase64: result.data }));
        }
      }
    });
  }, [character, generatePortraitMutation]);

  const handleGenerateVocalDescription = useCallback(async () => {
    if (!character.voiceSampleBase64) {
      toast.error("Please upload a voice sample first.");
      return;
    }
    generateVocalDescriptionMutation.mutate(character.voiceSampleBase64, {
      onSuccess: (result) => {
        if (result.data) {
          setCharacter(prev => ({ ...prev, vocalDescription: result.data }));
        }
      }
    });
  }, [character.voiceSampleBase64, generateVocalDescriptionMutation]);

  const handleEvolveCharacter = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    evolveCharacterMutation.mutate(
      { character: character as Character, prompt },
      {
        onSuccess: (result) => {
          if (result.data) {
            setCharacter(prev => ({
              ...prev,
              ...result.data,
              name: result.data?.name || prev.name, // Ensure name is never undefined
            }));
            setPrompt('');
          }
        }
      }
    );
  };

  const handleSave = useCallback(async () => {
    // Validate with Zod
    const validation = CharacterFormSchema.safeParse(character);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => err.message).join(', ');
      toast.error(`Validation errors: ${errorMessages}`);
      return;
    }

    const now = new Date().toISOString();
    const characterToSave: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'> = {
      name: character.name || '',
      title: character.title || '',
      synopsis: character.synopsis || '',
      personality: character.personality || '',
      flaws: character.flaws || '',
      strengths: character.strengths || '',
      appearance: character.appearance || '',
      backstory: character.backstory || '',
      portraitBase64: character.portraitBase64 || null,
      voiceSampleBase64: character.voiceSampleBase64 || null,
      vocalDescription: character.vocalDescription || null,
      genre: character.genre
    };

    if (initialCharacter?.id) {
      updateCharacterMutation.mutate(
        { id: initialCharacter.id, updates: characterToSave },
        {
          onSuccess: () => {
            onBack();
          }
        }
      );
    } else {
      addCharacterMutation.mutate(characterToSave, {
        onSuccess: () => {
          onBack();
        }
      });
    }
  }, [character, initialCharacter, updateCharacterMutation, addCharacterMutation, onBack]);

  const handleDelete = useCallback(() => {
    if (!initialCharacter?.id) return; // Use initialCharacter directly and check for id
    
    if (window.confirm('Are you sure you want to delete this character? This cannot be undone.')) {
      deleteCharacterMutation.mutate(initialCharacter.id, {
        onSuccess: () => {
          onBack();
        }
      });
    }
  }, [initialCharacter, deleteCharacterMutation, onBack]);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-800 text-white">
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center text-indigo-300 hover:text-indigo-100 transition"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Back to Library
        </button>
        <h1 className="text-2xl font-bold">{initialCharacter ? 'Edit Character' : 'Create New Character'}</h1>
        <div className="flex space-x-4">
          <ImportExportMenu character={character} />
          {initialCharacter && (
            <button 
              onClick={handleDelete}
              className="text-red-400 hover:text-red-200 transition"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <PortraitManager
            portraitBase64={character.portraitBase64 || undefined}
            isPortraitLoading={generatePortraitMutation.isPending}
            handleFileChange={handleFileChange}
            handleGeneratePortrait={handleGeneratePortrait}
          />

          <VoiceManager
            voiceSampleBase64={character.voiceSampleBase64 || undefined}
            isAiLoading={generateVocalDescriptionMutation.isPending}
            handleFileChange={handleFileChange}
            handleGenerateVocalDescription={handleGenerateVocalDescription}
          />
        </div>

        <div className="md:col-span-2">
          <CharacterFields
            character={character}
            handleChange={handleChange}
            handleFileChange={handleFileChange as any}
            handleGenreChange={handleGenreChange}
            genres={genres}
          />
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-bold text-indigo-300 mb-4">Evolve with AI</h3>
        <div className="space-y-4">
          <TextareaField
            label="Describe changes or additions..."
            id="prompt"
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Give the character a mysterious scar over their left eye', 'Make the backstory more tragic', 'They found a powerful artifact, describe it'"
          />
          <div className="flex justify-end gap-4">
            <Button onClick={handleEvolveCharacter} variant="secondary" disabled={evolveCharacterMutation.isPending || !prompt}>
              <SparklesIcon className={`mr-2 h-5 w-5 ${evolveCharacterMutation.isPending ? 'animate-spin' : ''}`} />
              {evolveCharacterMutation.isPending ? 'Evolving...' : 'Evolve Character'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end gap-4">
        <Button onClick={handleFleshOut} variant="secondary" disabled={fleshOutMutation.isPending}>
          <SparklesIcon className={`mr-2 h-5 w-5 ${fleshOutMutation.isPending ? 'animate-spin' : ''}`} />
          {fleshOutMutation.isPending ? 'Generating...' : 'Flesh out with AI'}
        </Button>
        <Button onClick={handleSave}>
          Save Character
        </Button>
      </div>

      {showAudioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg w-11/12 max-w-3xl h-3/4">
            <iframe 
              src="/audio_modal.html" 
              className="w-full h-full border-none"
              onLoad={(e) => {
                // Pass the file to the iframe once it's loaded
                const iframe = e.target as HTMLIFrameElement;
                const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
                if (iframe.contentWindow && fileInput && fileInput.files && fileInput.files[0]) {
                  iframe.contentWindow.postMessage({ type: 'audioFile', file: fileInput.files[0] }, '*');
                }
              }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterForm;
