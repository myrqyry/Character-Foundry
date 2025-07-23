
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Character, Genre, CharacterVersion } from '../types';
import Button from './Button';
import { ArrowLeftIcon, SparklesIcon, TrashIcon, UserIcon, UploadIcon } from './Icons';
import { fleshOutCharacter, generatePortrait, evolveCharacter } from '../services/geminiService';
import { useCharacterStore } from '../store';
import VersionHistory from './VersionHistory';
import GenreSelect from './GenreSelect';
import ImportExportMenu from './ImportExportMenu';

interface CharacterFormProps {
  initialCharacter: Character | null;
  onBack: () => void;
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
    <input id={id} {...props} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
  </div>
);

import PlayButton from './PlayButton';

const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
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
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (fileType === 'image') {
          setCharacter(prev => ({ ...prev, portraitBase64: base64String }));
        } else {
          setCharacter(prev => ({ ...prev, voiceSampleBase64: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFleshOut = useCallback(async () => {
    setIsAiLoading(true);
    const aiResult = await fleshOutCharacter({ ...character });
    if (aiResult) {
      setCharacter(prev => ({...prev, ...aiResult}));
    } else {
      alert("Failed to generate details with AI. Please check the console for errors.");
    }
    setIsAiLoading(false);
  }, [character]);

  const handleGeneratePortrait = useCallback(async () => {
    setIsPortraitLoading(true);
    const imageBase64 = await generatePortrait(character);
    if (imageBase64) {
      setCharacter(prev => ({ ...prev, portraitBase64: imageBase64 }));
    } else {
      alert("Failed to generate portrait with AI. Please check the console for errors.");
    }
    setIsPortraitLoading(false);
  }, [character]);

  const handleEvolveCharacter = useCallback(async () => {
    if (!prompt) return;
    setIsAiLoading(true);
    const aiResult = await evolveCharacter({ ...character }, prompt);
    if (aiResult) {
      setCharacter(prev => ({...prev, ...aiResult}));
      setPrompt(''); // Clear the prompt after successful evolution
    } else {
      alert("Failed to evolve character with AI. Please check the console for errors.");
    }
    setIsAiLoading(false);
  }, [character, prompt]);

  const handlePlay = useCallback(async (text: string, fieldId: string) => {
    if (nowPlaying === fieldId) {
      audioRef.current?.pause();
      setNowPlaying(null);
      return;
    }

    setNowPlaying(fieldId);
    const audioBase64 = await textToSpeech(text);
    if (audioBase64) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioBase64);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => setNowPlaying(null);
    } else {
      alert("Failed to generate audio. Please check the console for errors.");
      setNowPlaying(null);
    }
  }, [nowPlaying]);

  const handleSave = () => {
    const now = new Date().toISOString();
    
    if (initialCharacter) {
      // Update existing character
      const updates: Partial<Character> = {
        ...character,
        updatedAt: now,
      };
      updateCharacter(initialCharacter.id, updates);
    } else {
      // Create new character
      const newCharacter: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'> & {
        createdAt: string;
        updatedAt: string;
        currentVersion: number;
        versions: CharacterVersion[];
      } = {
        name: character.name || 'Untitled Character',
        title: character.title || '',
        synopsis: character.synopsis || '',
        personality: character.personality || '',
        flaws: character.flaws || '',
        strengths: character.strengths || '',
        appearance: character.appearance || '',
        backstory: character.backstory || '',
        portraitBase64: character.portraitBase64 || null,
        voiceSampleBase64: character.voiceSampleBase64 || null,
        genre: character.genre,
        createdAt: now,
        updatedAt: now,
        currentVersion: 1,
        versions: []
      };
      addCharacter(newCharacter);
    }
    onBack();
  };
  
  const handleDelete = () => {
    if (initialCharacter && window.confirm("Are you sure you want to delete this character? This action cannot be undone.")) {
      deleteCharacter(initialCharacter.id);
      onBack();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-6">
            <Button onClick={onBack} variant="ghost" className="pl-2">
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
                <ImportExportMenu character={character} />
                {initialCharacter && (
                    <Button onClick={handleDelete} variant="danger">
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                )}
            </div>
        </header>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left Column: Portrait and Media */}
            <div className="md:col-span-1 space-y-4">
                <div className="w-full aspect-square bg-gray-700 rounded-md flex items-center justify-center border-2 border-dashed border-gray-600">
                    {character.portraitBase64 ? (
                        <img src={character.portraitBase64} alt="Portrait" className="w-full h-full object-cover rounded-md"/>
                    ) : (
                        <div className="text-center text-gray-400">
                            <UserIcon className="mx-auto h-16 w-16" />
                            <p>No Portrait</p>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                  <Button onClick={handleGeneratePortrait} variant="secondary" className="w-full" disabled={isPortraitLoading}>
                      <SparklesIcon className={`mr-2 h-4 w-4 ${isPortraitLoading ? 'animate-spin' : ''}`} />
                      {isPortraitLoading ? 'Generating...' : 'Generate Portrait with AI'}
                  </Button>
                  <label className="w-full text-center cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition inline-flex items-center justify-center">
                    <UploadIcon className="mr-2 h-4 w-4"/> 
                    Upload Portrait
                    <input type='file' name="portrait" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                  </label>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium text-indigo-300 mb-1">Voice Sample</h3>
                  {character.voiceSampleBase64 ? (
                      <audio controls src={character.voiceSampleBase64} className="w-full"/>
                  ) : (
                      <p className="text-sm text-gray-500">No voice sample uploaded.</p>
                  )}
                  <label className="w-full mt-2 text-center cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition inline-flex items-center justify-center">
                    <UploadIcon className="mr-2 h-4 w-4"/>
                    Upload Voice
                    <input type='file' name="voice" accept="audio/*" className="hidden" onChange={(e) => handleFileChange(e, 'audio')} />
                  </label>
                </div>
            </div>

            {/* Right Column: Character Details */}
            <div className="md:col-span-2 space-y-4">
                <InputField label="Name" id="name" name="name" value={character.name || ''} onChange={handleChange} />
                <InputField label="Title" id="title" name="title" value={character.title || ''} onChange={handleChange} />
                <GenreSelect
                    value={character.genre}
                    onChange={handleGenreChange}
                    genres={genres}
                />
                <TextareaField label="Synopsis" id="synopsis" name="synopsis" value={character.synopsis || ''} onChange={handleChange} onPlay={() => handlePlay(character.synopsis || '', 'synopsis')} isPlaying={nowPlaying === 'synopsis'} />
            </div>

            {/* Version History Panel */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-lg font-medium text-white">Version History</h3>
              {initialCharacter && (
                <VersionHistory 
                  character={initialCharacter} 
                  onRestore={handleRestoreVersion}
                  currentVersion={initialCharacter.currentVersion || 1}
                />
              )}
            </div>
        </div>

        {/* Full-width fields */}
        <div className="mt-6 space-y-4">
          <TextareaField label="Physical Appearance" id="appearance" name="appearance" value={character.appearance || ''} onChange={handleChange} onPlay={() => handlePlay(character.appearance || '', 'appearance')} isPlaying={nowPlaying === 'appearance'} />
          <TextareaField label="Personality" id="personality" name="personality" value={character.personality || ''} onChange={handleChange} onPlay={() => handlePlay(character.personality || '', 'personality')} isPlaying={nowPlaying === 'personality'} />
          <TextareaField label="Strengths" id="strengths" name="strengths" value={character.strengths || ''} onChange={handleChange} onPlay={() => handlePlay(character.strengths || '', 'strengths')} isPlaying={nowPlaying === 'strengths'} />
          <TextareaField label="Flaws" id="flaws" name="flaws" value={character.flaws || ''} onChange={handleChange} onPlay={() => handlePlay(character.flaws || '', 'flaws')} isPlaying={nowPlaying === 'flaws'} />
          <TextareaField label="Backstory" id="backstory" name="backstory" value={character.backstory || ''} onChange={handleChange} onPlay={() => handlePlay(character.backstory || '', 'backstory')} isPlaying={nowPlaying === 'backstory'} />
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
      </div>
    </div>
  );
};

export default CharacterForm;
