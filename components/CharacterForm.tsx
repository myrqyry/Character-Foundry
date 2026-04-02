import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import toast from 'react-hot-toast';
import { Character, Genre, CharacterDraft } from '../types';
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

const AudioClipModal = lazy(() => import('./AudioClipModal'));

interface CharacterFormProps {
  initialCharacter: Character | null;
  onBack: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ initialCharacter, onBack }) => {
  // Initialize directly from prop — parent uses key={id} to reset on character change
  const [character, setCharacter] = useState<CharacterDraft>(() => initialCharacter ?? {});
  const [prompt, setPrompt] = useState('');
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [tempAudioFile, setTempAudioFile] = useState<File | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Keep a ref to the latest character value so callbacks don't need it in their dep arrays,
  // preventing invalidation on every keystroke.
  const characterRef = useRef(character);
  useEffect(() => {
    characterRef.current = character;
  });

  const genres = useCharacterStore((s) => s.genres);
  const fleshOutMutation = useFleshOutCharacter();
  const generatePortraitMutation = useGeneratePortrait();
  const generateVocalDescriptionMutation = useGenerateVocalDescription();
  const evolveCharacterMutation = useEvolveCharacter();
  const addCharacterMutation = useAddCharacter();
  const updateCharacterMutation = useUpdateCharacter();
  const deleteCharacterMutation = useDeleteCharacter();
  const indexLoreMutation = useIndexCharacterLore();

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

  const handleAudioClipped = useCallback((base64: string) => {
    setCharacter(prev => ({ ...prev, voiceSampleBase64: base64 }));
    setShowAudioModal(false);
    setTempAudioFile(null);
  }, []);

  const handleAudioModalClose = useCallback(() => {
    setShowAudioModal(false);
    setTempAudioFile(null);
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
    deleteCharacterMutation.mutate(initialCharacter.id, {
      onSuccess: () => onBack()
    });
  }, [initialCharacter, deleteCharacterMutation, onBack]);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-800 text-white">
      <div className="mb-6">
        {/* Top row: back + actions */}
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={onBack}
            className="flex items-center text-indigo-300 hover:text-indigo-100 transition"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back to Library
          </button>
          <div className="flex space-x-4 items-center">
            <ImportExportMenu character={character} />
            {initialCharacter && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-400">Delete?</span>
                  <button
                    onClick={handleDelete}
                    className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded transition"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-400 hover:text-red-200 transition"
                  aria-label="Delete character"
                >
                  <TrashIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              )
            )}
          </div>
        </div>
        {/* Title on its own line to prevent squeeze on mobile */}
        <h1 className="text-2xl font-bold text-center sm:text-left">
          {initialCharacter ? 'Edit Character' : 'Create New Character'}
        </h1>
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

      {showAudioModal && tempAudioFile && (
        <Suspense fallback={null}>
          <AudioClipModal
            file={tempAudioFile}
            onClipped={handleAudioClipped}
            onClose={handleAudioModalClose}
          />
        </Suspense>
      )}
    </div>
  );
};

export default CharacterForm;
