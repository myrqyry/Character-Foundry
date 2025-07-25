import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Character, Genre, CharacterVersion } from '../types';
import Button from './Button';
import characterTraits from '../character_traits.json';
import { ArrowLeftIcon, SparklesIcon, TrashIcon, UserIcon, UploadIcon } from './Icons';
import { fleshOutCharacter, generatePortrait, evolveCharacter, generateVocalDescription } from '../services/geminiService';
import { useCharacterStore } from '../store';
import VersionHistory from './VersionHistory';
import GenreSelect from './GenreSelect';
import ImportExportMenu from './ImportExportMenu';
import PortraitManager from './PortraitManager';
import VoiceManager from './VoiceManager';
import CharacterFields from './CharacterFields';

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

import { textToSpeech } from '../services/geminiService';

const CharacterForm: React.FC<CharacterFormProps> = ({ initialCharacter, onBack }) => {
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPortraitLoading, setIsPortraitLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const { 
    addCharacter, 
    updateCharacter, 
    deleteCharacter
  } = useCharacterStore();
  const genres = useCharacterStore((state) => state.genres);
  
  const handleRestoreVersion = (version: CharacterVersion) => {
    if (window.confirm(`Are you sure you want to restore version ${version.version}? This will replace your current character data.`)) {
      const { version: _, updatedAt, changes, ...characterData } = version as any;
      setCharacter(characterData);
    }
  };


  useEffect(() => {
    setCharacter(initialCharacter || {});
  }, [initialCharacter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({ ...prev, [name]: value }));
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
    setIsAiLoading(true);
    const { data, error } = await fleshOutCharacter({ ...character });
    if (data) {
      setCharacter(prev => ({...prev, ...data}));
    } else if (error) {
      console.error(error);
      alert(`AI generation failed: ${error}`);
    }
    setIsAiLoading(false);
  }, [character]);

  const handleGeneratePortrait = useCallback(async () => {
    if (!character) return;
    
    setIsPortraitLoading(true);
    const { data, error } = await generatePortrait({ ...character });
    if (data) {
      setCharacter(prev => ({ ...prev, portraitBase64: data }));
    } else if (error) {
      console.error(error);
      alert(`Portrait generation failed: ${error}`);
    }
    setIsPortraitLoading(false);
  }, [character]);

  const handleGenerateVocalDescription = useCallback(async () => {
    if (!character.voiceSampleBase64) {
      alert("Please upload a voice sample first.");
      return;
    }
    setIsAiLoading(true);
    const { data, error } = await generateVocalDescription(character.voiceSampleBase64);
    if (data) {
      setCharacter(prev => ({ ...prev, vocalDescription: data }));
    } else if (error) {
      console.error(error);
      alert(`Vocal description generation failed: ${error}`);
    }
    setIsAiLoading(false);
  }, [character.voiceSampleBase64, generateVocalDescription]);

  const handleEvolveCharacter = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setIsAiLoading(true);
    const { data, error } = await evolveCharacter({ ...character }, prompt);
    if (data) {
      setCharacter(prev => ({ ...prev, ...data }));
      setPrompt('');
    } else if (error) {
      console.error(error);
      alert(`Character evolution failed: ${error}`);
    }
    setIsAiLoading(false);
  }, [character, prompt]);

  const handlePlay = useCallback(async (text: string, fieldName: string) => {
    if (!text) return;
    
    if (nowPlaying === fieldName) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setNowPlaying(null);
      return;
    }
    
    setNowPlaying(fieldName);
    
    try {
      const { data: audioBase64, error } = await textToSpeech(text);
      if (audioBase64) {
        const audio = new Audio(audioBase64);
        audioRef.current = audio;
        audio.onended = () => setNowPlaying(null);
        audio.play();
      } else if (error) {
        console.error(error);
        setNowPlaying(null);
      }
    } catch (error) {
      console.error("Error playing text:", error);
      setNowPlaying(null);
    }
  }, [nowPlaying]);

  const handleSave = () => {
    if (!character.name) {
      alert("Please provide at least a name for the character.");
      return;
    }
    
    const characterToSave: Character = {
      ...character,
      id: character.id || Date.now().toString(),
      name: character.name, // Ensure name is present
      createdAt: character.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentVersion: character.currentVersion ? character.currentVersion + 1 : 1,
      versions: character.versions || [],
    } as Character; // Cast to Character to satisfy TypeScript
    
    if (initialCharacter) {
      updateCharacter(characterToSave);
    } else {
      addCharacter(characterToSave);
    }
    
    onBack();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      if (initialCharacter) {
        deleteCharacter(initialCharacter.id);
      }
      onBack();
    }
  };

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
            portraitBase64={character.portraitBase64}
            isPortraitLoading={isPortraitLoading}
            handleFileChange={handleFileChange}
            handleGeneratePortrait={handleGeneratePortrait}
          />

          <VoiceManager
            voiceSampleBase64={character.voiceSampleBase64}
            isAiLoading={isAiLoading}
            handleFileChange={handleFileChange}
            handleGenerateVocalDescription={handleGenerateVocalDescription}
          />
        </div>

        <CharacterFields
          character={character}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
        />

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
            <Button onClick={handleEvolveCharacter} variant="secondary" disabled={isAiLoading || !prompt}>
              <SparklesIcon className={`mr-2 h-5 w-5 ${isAiLoading ? 'animate-spin' : ''}`} />
              {isAiLoading ? 'Evolving...' : 'Evolve Character'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end gap-4">
        <Button onClick={handleFleshOut} variant="secondary" disabled={isAiLoading}>
          <SparklesIcon className={`mr-2 h-5 w-5 ${isAiLoading ? 'animate-spin' : ''}`} />
          {isAiLoading ? 'Generating...' : 'Flesh out with AI'}
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
