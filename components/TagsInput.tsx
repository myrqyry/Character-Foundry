import React, { useState } from 'react';
import { XIcon } from './Icons';

interface TagsInputProps {
  label: string;
  name: string;
  value: string[];
  onChange: (name: string, value: string[]) => void;
}

const TagsInput: React.FC<TagsInputProps> = ({ label, name, value, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange(name, [...value, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(name, value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 bg-gray-700 border border-gray-600 rounded-md">
        {value.map(tag => (
          <div key={tag} className="flex items-center bg-indigo-600 text-white rounded-full px-3 py-1 text-sm">
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-2">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="bg-transparent focus:outline-none text-white"
          placeholder="Add a tag..."
        />
      </div>
    </div>
  );
};

export default TagsInput;
