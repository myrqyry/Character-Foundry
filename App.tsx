import { lazy, Suspense, useMemo, useState, useTransition } from 'react';
import { View } from './types';
import { SparklesIcon, SettingsIcon } from './components/Icons';
import { useCharacterStore, useCharacterActions } from './store';
import { Toaster } from 'react-hot-toast';
import ThemeToggle from './components/ThemeToggle';

// Lazy-load heavy view components so only the active view's bundle is fetched.
const Dashboard = lazy(() => import('./components/Dashboard'));
const CharacterForm = lazy(() => import('./components/CharacterForm'));
const GenerationOptionsModal = lazy(() => import('./components/GenerationOptionsModal'));

function App() {
  // Use fine-grained selectors so App only re-renders when these three specific
  // values change — not when TTS/model settings or other store fields change.
  const characters         = useCharacterStore((s) => s.characters);
  const currentView        = useCharacterStore((s) => s.currentView);
  const editingCharacterId = useCharacterStore((s) => s.editingCharacterId);

  const { setCurrentView, setEditingCharacterId } = useCharacterActions();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [, startTransition] = useTransition();

  const handleCreateNew = () => {
    startTransition(() => {
      setEditingCharacterId(null);
      setCurrentView(View.Editor);
    });
  };

  const handleEditCharacter = (id: string) => {
    startTransition(() => {
      setEditingCharacterId(id);
      setCurrentView(View.Editor);
    });
  };

  const handleBackToDashboard = () => {
    startTransition(() => {
      setCurrentView(View.Dashboard);
      setEditingCharacterId(null);
    });
  };

  // Memoised so the linear scan only runs when the characters array or the target id changes.
  const editingCharacter = useMemo(
    () => editingCharacterId ? characters.find(c => c.id === editingCharacterId) ?? null : null,
    [characters, editingCharacterId]
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
        <h1 className="text-3xl font-bold text-indigo-400">The Character Foundry</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={() => setShowOptionsModal(true)}
            className="p-2 rounded-full hover:bg-gray-700 transition"
            aria-label="Open Generation Options"
            title="Generation Options"
          >
            <SettingsIcon className="w-6 h-6 text-gray-300" aria-hidden="true" />
          </button>
        </div>
      </header>
      <main>
        {/* Suspense boundary covers both lazy views — fallback is intentionally minimal */}
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-gray-400">Loading…</div>}>
          {currentView === View.Dashboard ? (
            <Dashboard
              characters={characters}
              onCreateNew={handleCreateNew}
              onEditCharacter={handleEditCharacter}
            />
          ) : (
            // key prop causes CharacterForm to fully remount when the editing target changes,
            // which replaces the useEffect-driven state-sync pattern with a clean reset.
            <CharacterForm
              key={editingCharacterId ?? 'new'}
              initialCharacter={editingCharacter}
              onBack={handleBackToDashboard}
            />
          )}
        </Suspense>
      </main>
      <footer className="text-center py-4 text-gray-500 text-xs">
        <p className="flex items-center justify-center gap-1">Powered by The Character Foundry & <SparklesIcon className="w-4 h-4 text-indigo-400" /> Gemini API</p>
      </footer>

      {/* Conditionally rendered so the modal bundle is only loaded when opened */}
      {showOptionsModal && (
        <Suspense fallback={null}>
          <GenerationOptionsModal
            isOpen={showOptionsModal}
            onClose={() => setShowOptionsModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
