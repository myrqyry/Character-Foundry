import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Character, Genre } from '../types';
import Button from './Button';
import { ArrowLeftIcon, SparklesIcon, TrashIcon } from './Icons';
import { 
  useFleshOutCharacter, 
  useGeneratePortrait, 
  useGenerateVocalDescription, 
  useEvolveCharacter, 
  useAddCharacter, 
  useUpdateCharacter, 
  useDeleteCharacter,
  useIndexCharacterLore
} from '../hooks/useAI';
import { useCharacterStore } from '../store';
import ImportExportMenu from './ImportExportMenu';
import PortraitManager from './PortraitManager';
import VoiceManager from './VoiceManager';
import CharacterFields from './CharacterFields';
import { CharacterFormSchema } from '../schemas/validation';
import { TextareaField } from './FormInputs';

interface CharacterFormProps {
  initialCharacter: Character | null;
  onBack: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ initialCharacter, onBack }) => {
  // Initialize directly from prop — parent uses key={id} to reset on character change
  const [character, setCharacter] = useState<Partial<Character>>(() => initialCharacter ?? {});
  const [prompt, setPrompt] = useState('');
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [tempAudioFile, setTempAudioFile] = useState<File | null>(null);

  // Keep a ref to the latest character value so callbacks don't need it in their dep arrays,
  // preventing invalidation on every keystroke.
  const characterRef = useRef(character);
  useEffect(() => {
    characterRef.current = character;
  });

  const { genres } = useCharacterStore((s) => ({ genres: s.genres }));
  const fleshOutMutation = useFleshOutCharacter();
  const generatePortraitMutation = useGeneratePortrait();
  const generateVocalDescriptionMutation = useGenerateVocalDescription();
  const evolveCharacterMutation = useEvolveCharacter();
  const addCharacterMutation = useAddCharacter();
  const updateCharacterMutation = useUpdateCharacter();
  const deleteCharacterMutation = useDeleteCharacter();
  const indexLoreMutation = useIndexCharacterLore();

  useEffect(() => {
    const handleAudioClipped = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setCharacter(prev => ({ ...prev, voiceSampleBase64: customEvent.detail }));
      setShowAudioModal(false);
      setTempAudioFile(null);
    };

    document.addEventListener('audioClipped', handleAudioClipped);
    return () => {
      document.removeEventListener('audioClipped', handleAudioClipped);
    };
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleGenreChange = useCallback((genre: Genre) => {
    setCharacter(prev => ({ ...prev, genre }));
  }, []);

  const handleTagsChange = useCallback((name: string, values: string[]) => {
    setCharacter((prev) => ({
      ...prev,
      [name]: values,
    }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => {
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
        setTempAudioFile(file);
        setShowAudioModal(true);
        e.target.value = ''; // Reset input
      }
    }
  }, []);

  // Read character from ref inside callbacks so the callback identity stays stable
  // across every keystroke — only re-created when the mutation object itself changes.
  const handleFleshOut = useCallback(async () => {
    fleshOutMutation.mutate(characterRef.current, {
      onSuccess: (result) => {
        if (result.data) {
          setCharacter(prev => ({ ...prev, ...result.data }));
        }
      }
    });
  }, [fleshOutMutation]);

  const handleGeneratePortrait = useCallback(async () => {
    generatePortraitMutation.mutate(characterRef.current, {
      onSuccess: (result) => {
        if (result.data) {
          setCharacter(prev => ({ ...prev, portraitBase64: result.data }));
        }
      }
    });
  }, [generatePortraitMutation]);

  const handleGenerateVocalDescription = useCallback(async () => {
    if (!characterRef.current.voiceSampleBase64) {
      toast.error("Please upload a voice sample first.");
      return;
    }
    generateVocalDescriptionMutation.mutate(characterRef.current.voiceSampleBase64, {
      onSuccess: (result) => {
        if (result.data) {
          setCharacter(prev => ({ ...prev, vocalDescription: result.data }));
        }
      }
    });
  }, [generateVocalDescriptionMutation]);

  const handleTranscriptChange = useCallback((text: string) => {
    setCharacter(prev => ({ ...prev, voiceSampleTranscript: text }));
  }, []);

  const handleEvolveCharacter = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    evolveCharacterMutation.mutate(
      { character: characterRef.current, prompt },
      {
        onSuccess: (result) => {
          if (result.data) {
            setCharacter(prev => ({
              ...prev,
              ...result.data,
              name: result.data?.name || prev.name,
            }));
            setPrompt('');
          }
        }
      }
    );
  }, [prompt, evolveCharacterMutation]);

  const handleSave = useCallback(async () => {
    const current = characterRef.current;
    const validation = CharacterFormSchema.safeParse(current);
    if (!validation.success) {
      const errorMessages = validation.error.issues.map((err) => err.message).join(', ');
      toast.error(`Validation errors: ${errorMessages}`);
      return;
    }

    const characterToSave: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'> = {
      name: current.name || '',
      title: current.title || '',
      synopsis: current.synopsis || '',
      personality: current.personality || '',
      flaws: current.flaws || '',
      strengths: current.strengths || '',
      appearance: current.appearance || '',
      backstory: current.backstory || '',
      portraitBase64: current.portraitBase64 || null,
      voiceSampleBase64: current.voiceSampleBase64 || null,
      voiceSampleTranscript: current.voiceSampleTranscript || null,
      vocalDescription: current.vocalDescription || null,
      genre: current.genre
    };

    if (initialCharacter?.id) {
      updateCharacterMutation.mutate(
        { id: initialCharacter.id, updates: characterToSave },
        { 
          onSuccess: (updatedChar) => {
            if (updatedChar) {
              indexLoreMutation.mutate(updatedChar);
            }
            onBack();
          } 
        }
      );
    } else {
      addCharacterMutation.mutate(characterToSave, {
        onSuccess: (newChar) => {
          if (newChar) {
            indexLoreMutation.mutate(newChar);
          }
          onBack();
        }
      });
    }
  }, [initialCharacter, updateCharacterMutation, addCharacterMutation, indexLoreMutation, onBack]);

  const handleDelete = useCallback(() => {
    if (!initialCharacter?.id) return;
    if (window.confirm('Are you sure you want to delete this character? This cannot be undone.')) {
      deleteCharacterMutation.mutate(initialCharacter.id, {
        onSuccess: () => onBack()
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
            <button onClick={handleDelete} className="text-red-400 hover:text-red-200 transition">
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
            voiceSampleTranscript={character.voiceSampleTranscript}
            isAiLoading={generateVocalDescriptionMutation.isPending}
            handleFileChange={handleFileChange}
            handleGenerateVocalDescription={handleGenerateVocalDescription}
            handleTranscriptChange={handleTranscriptChange}
          />
        </div>

        <div className="md:col-span-2">
          <CharacterFields
            character={character}
            handleChange={handleChange}
            handleTagsChange={handleTagsChange}
            handleFileChange={handleFileChange}
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
            placeholder="e.g., 'Give the character a mysterious scar over their left eye', 'Make the backstory more tragic'"
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
                const iframe = e.target as HTMLIFrameElement;
                if (iframe.contentWindow && tempAudioFile) {
                  iframe.contentWindow.postMessage({ type: 'audioFile', file: tempAudioFile }, '*');
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
