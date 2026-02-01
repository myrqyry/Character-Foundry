import React from 'react';
import { Genre } from '../types';

interface GenreSelectProps {
  value: Genre | undefined;
  onChange: (value: Genre) => void;
  genres: Genre[];
}

const GenreSelect: React.FC<GenreSelectProps> = ({ value, onChange, genres }) => {
  return (
    <div>
      <label htmlFor="genre" className="block text-sm font-medium text-indigo-300 mb-1">
        Genre / Tone
      </label>
      <select
        id="genre"
        name="genre"
        value={value || ''}
        onChange={(e) => onChange(e.target.value as Genre)}
        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      >
        <option value="" disabled>
          Select a genre...
        </option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenreSelect;
