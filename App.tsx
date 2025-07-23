
import React, { useCallback } from 'react';
import { View } from './types';
import Dashboard from './components/Dashboard';
import CharacterForm from './components/CharacterForm';
import { SparklesIcon } from './components/Icons';
import { useCharacterStore, useCharacterActions } from './store';

function App() {
  // Use separate hooks for state and actions
  const { characters, currentView, editingCharacterId } = useCharacterStore();
  const { setCurrentView, setEditingCharacterId } = useCharacterActions();

  const handleCreateNew = useCallback(() => {
    setEditingCharacterId(null);
    setCurrentView(View.Editor);
  }, [setCurrentView, setEditingCharacterId]);

  const handleEditCharacter = useCallback((id: string) => {
    setEditingCharacterId(id);
    setCurrentView(View.Editor);
  }, [setCurrentView, setEditingCharacterId]);

  const handleBackToDashboard = useCallback(() => {
    setCurrentView(View.Dashboard);
    setEditingCharacterId(null);
  }, [setCurrentView, setEditingCharacterId]);

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
            onBack={handleBackToDashboard}
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
