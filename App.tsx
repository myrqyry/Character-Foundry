
import React, { useState, useCallback } from 'react';
import { Character, View } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Dashboard from './components/Dashboard';
import CharacterForm from './components/CharacterForm';
import { SparklesIcon } from './components/Icons';

function App() {
  const [characters, setCharacters] = useLocalStorage<Character[]>('characters', []);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);

  const handleCreateNew = useCallback(() => {
    setEditingCharacterId(null);
    setCurrentView(View.Editor);
  }, []);

  const handleEditCharacter = useCallback((id: string) => {
    setEditingCharacterId(id);
    setCurrentView(View.Editor);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setCurrentView(View.Dashboard);
    setEditingCharacterId(null);
  }, []);

  const handleSaveCharacter = useCallback((characterToSave: Character) => {
    setCharacters(prev => {
      const exists = prev.some(c => c.id === characterToSave.id);
      if (exists) {
        return prev.map(c => c.id === characterToSave.id ? characterToSave : c);
      }
      return [...prev, characterToSave].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    handleBackToDashboard();
  }, [setCharacters, handleBackToDashboard]);

  const handleDeleteCharacter = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this character? This action cannot be undone.")) {
        setCharacters(prev => prev.filter(c => c.id !== id));
        handleBackToDashboard();
    }
  }, [setCharacters, handleBackToDashboard]);

  const editingCharacter = editingCharacterId ? characters.find(c => c.id === editingCharacterId) ?? null : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main>
        {currentView === View.Dashboard ? (
          <Dashboard
            characters={characters}
            onCreateNew={handleCreateNew}
            onEditCharacter={handleEditCharacter}
          />
        ) : (
          <CharacterForm
            initialCharacter={editingCharacter}
            onSave={handleSaveCharacter}
            onBack={handleBackToDashboard}
            onDelete={handleDeleteCharacter}
          />
        )}
      </main>
      <footer className="text-center py-4 text-gray-500 text-xs">
        <p className="flex items-center justify-center gap-1">Powered by The Character Foundry & <SparklesIcon className="w-4 h-4 text-indigo-400" /> Gemini API</p>
      </footer>
    </div>
  );
}

export default App;
