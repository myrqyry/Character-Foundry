
import React, { useState, useEffect, useCallback } from 'react';
import { Character, PartialCharacter, Genre } from '../types';
import Button from './Button';
import { ArrowLeftIcon, SparklesIcon, TrashIcon, UserIcon, UploadIcon } from './Icons';
import { fleshOutCharacter } from '../services/geminiService';
import { useCharacterStore, useStoreActions } from '../store';
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

const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
    <textarea id={id} {...props} rows={5} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
  </div>
);

const CharacterForm: React.FC<CharacterFormProps> = ({ initialCharacter, onBack }) => {
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { addCharacter, updateCharacter, deleteCharacter } = useStoreActions();
  const genres = useCharacterStore((state) => state.genres);

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

  const handleSave = () => {
    const finalCharacter: Character = {
      id: character.id || `char_${Date.now()}`,
      createdAt: character.createdAt || new Date().toISOString(),
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
    };

    if (initialCharacter) {
      updateCharacter(finalCharacter);
    } else {
      addCharacter(finalCharacter);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div>
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
                <TextareaField label="Synopsis" id="synopsis" name="synopsis" value={character.synopsis || ''} onChange={handleChange} />
            </div>
        </div>

        {/* Full-width fields */}
        <div className="mt-6 space-y-4">
          <TextareaField label="Physical Appearance" id="appearance" name="appearance" value={character.appearance || ''} onChange={handleChange} />
          <TextareaField label="Personality" id="personality" name="personality" value={character.personality || ''} onChange={handleChange} />
          <TextareaField label="Strengths" id="strengths" name="strengths" value={character.strengths || ''} onChange={handleChange} />
          <TextareaField label="Flaws" id="flaws" name="flaws" value={character.flaws || ''} onChange={handleChange} />
          <TextareaField label="Backstory" id="backstory" name="backstory" value={character.backstory || ''} onChange={handleChange} />
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
