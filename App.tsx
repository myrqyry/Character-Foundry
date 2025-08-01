import React, { useState } from 'react';
import { View } from './types';
import Dashboard from './components/Dashboard';
import CharacterForm from './components/CharacterForm';
import { SparklesIcon, SettingsIcon } from './components/Icons';
import { useCharacterStore, useCharacterActions } from './store';
import GenerationOptionsModal from './components/GenerationOptionsModal';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Use separate hooks for state and actions
  const { characters, currentView, editingCharacterId } = useCharacterStore();
  const { setCurrentView, setEditingCharacterId } = useCharacterActions();
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const handleCreateNew = () => {
    setEditingCharacterId(null);
    setCurrentView(View.Editor);
  };

  const handleEditCharacter = (id: string) => {
    setEditingCharacterId(id);
    setCurrentView(View.Editor);
  };

  const handleBackToDashboard = () => {
    setCurrentView(View.Dashboard);
    setEditingCharacterId(null);
  };

  const editingCharacter = editingCharacterId ? characters.find(c => c.id === editingCharacterId) ?? null : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <ErrorBoundary>
        <Toaster position="top-center" reverseOrder={false} />
        <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
          <h1 className="text-3xl font-bold text-indigo-400">The Character Foundry</h1>
          <button
            onClick={() => setShowOptionsModal(true)}
            className="p-2 rounded-full hover:bg-gray-700 transition"
            title="Generation Options"
          >
            <SettingsIcon className="w-6 h-6 text-gray-300" />
          </button>
        </header>
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

        <GenerationOptionsModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
        />
      </ErrorBoundary>
    </div>
  );
}

export default App;
