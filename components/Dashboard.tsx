
import React from 'react';
import { Character } from '../types';
import { PlusIcon, UserIcon } from './Icons';
import Button from './Button';
import ImportExportMenu from './ImportExportMenu';

interface CharacterCardProps {
  character: Character;
  onEdit: (id: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onEdit }) => (
  <div 
    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex flex-col cursor-pointer"
    onClick={() => onEdit(character.id)}
  >
    <div className="h-48 w-full bg-gray-700 flex items-center justify-center">
      {character.portraitBase64 ? (
        <img src={character.portraitBase64} alt={character.name} className="h-full w-full object-cover" />
      ) : (
        <UserIcon className="w-24 h-24 text-gray-500" />
      )}
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="text-xl font-bold text-white truncate">{character.name || 'Untitled Character'}</h3>
      <p className="text-sm text-indigo-400 mb-2 truncate">{character.title || 'No title'}</p>
      {character.genre && (
        <span className="mb-2 inline-block bg-indigo-500/20 text-indigo-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full self-start">
            {character.genre}
        </span>
      )}
      <p className="text-gray-400 text-sm flex-grow line-clamp-3">{character.synopsis || 'No synopsis provided.'}</p>
      <p className="text-xs text-gray-500 mt-3 self-end">Created: {new Date(character.createdAt).toLocaleDateString()}</p>
    </div>
  </div>
);

interface DashboardProps {
  characters: Character[];
  onEditCharacter: (id: string) => void;
  onCreateNew: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ characters, onEditCharacter, onCreateNew }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Character Dashboard</h1>
        <div className="flex items-center gap-2">
            <ImportExportMenu character={{}} />
            <Button onClick={onCreateNew}>
              <PlusIcon className="mr-2 h-5 w-5" />
              Create New Character
            </Button>
        </div>
      </div>

      {characters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {characters.map((char) => (
            <CharacterCard key={char.id} character={char} onEdit={onEditCharacter} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold text-white">The Foundry is Empty</h2>
          <p className="text-gray-400 mt-2 mb-6">Forge your first character to begin your epic tale.</p>
          <Button onClick={onCreateNew}>
            <PlusIcon className="mr-2 h-5 w-5" />
            Create a Character
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
