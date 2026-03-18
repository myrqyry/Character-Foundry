import React from 'react';
import { MoonIcon, SunIcon } from './Icons';
import { useTheme } from './ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5 text-yellow-400" aria-hidden="true" />
      ) : (
        <MoonIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;