import React, { memo } from 'react';
import { InputField, TextareaField } from './FormInputs';
import { UploadIcon } from './Icons';
import characterTraits from '../character_traits.json';
import GenreSelect from './GenreSelect';
import { Character, Genre } from '../types';
import TagsInput from './TagsInput';

type FieldType = 'text' | 'color' | 'textarea' | 'genre' | 'select' | 'tags' | 'file';

type CharacterFieldConfig = {
  name: string;
  type: FieldType;
  label: string;
  options?: string[];
};

interface CharacterFieldsProps {
  character: Partial<Character>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleTagsChange: (name: string, values: string[]) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => void;
  handleGenreChange: (genre: Genre) => void;
  genres: Genre[];
}

const traitsConfig = characterTraits as {
  characterTraits: Record<
    string,
    {
      title: string;
      description: string;
      fields: CharacterFieldConfig[];
    }
  >;
};

const CharacterFields: React.FC<CharacterFieldsProps> = memo(({
  character,
  handleChange,
  handleTagsChange,
  handleFileChange,
  handleGenreChange,
  genres,
}) => {
  const renderField = (field: CharacterFieldConfig) => {
    const { name, type, label, options } = field;
    const rawValue = character[name as keyof Character];
    const value = typeof rawValue === 'string' ? rawValue : '';

    switch (type) {
      case 'text':
      case 'color': {
        return (
          <InputField
            key={name}
            label={label}
            id={name}
            name={name}
            type={type}
            value={value || (type === 'color' ? '#000000' : '')}
            onChange={handleChange}
          />
        );
      }
      case 'textarea': {
        return <TextareaField key={name} label={label} id={name} name={name} value={value} onChange={handleChange} />;
      }
      case 'genre':
        return <GenreSelect key={name} value={character.genre} onChange={handleGenreChange} genres={genres} />;
      case 'select': {
        const value = typeof rawValue === 'string' ? rawValue : '';
        return (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
            <select
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              {(options ?? []).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      }
      case 'tags': {
        const value = Array.isArray(rawValue)
          ? rawValue.map((item) => String(item))
          : typeof rawValue === 'string'
            ? rawValue.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        return (
          <TagsInput
            key={name}
            label={label}
            name={name}
            value={value}
            onChange={handleTagsChange}
          />
        );
      }
      case 'file':
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 transition flex items-center">
              <UploadIcon className="mr-2 h-5 w-5" />
              Upload
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'audio')}
              />
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="md:col-span-2 space-y-4">
      {Object.entries(traitsConfig.characterTraits).map(([sectionKey, section]) => (
        <div key={sectionKey} className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">{section.title}</h3>
          <p className="text-sm text-gray-400 mb-4">{section.description}</p>
          <div className="space-y-4">
            {section.fields.map((field) => renderField(field))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default CharacterFields;
