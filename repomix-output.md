This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where content has been formatted for parsing in markdown style.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: public/fonts/*
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been formatted for parsing in markdown style
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
components/
  Button.tsx
  CharacterFields.tsx
  CharacterForm.tsx
  Dashboard.tsx
  ErrorBoundary.tsx
  GenerationOptionsModal.tsx
  GenreSelect.tsx
  Icons.tsx
  ImportExportMenu.tsx
  PlayButton.tsx
  PortraitManager.tsx
  QueryProvider.tsx
  TagsInput.tsx
  ThemeProvider.tsx
  ThemeToggle.tsx
  VersionHistory.tsx
  VoiceManager.tsx
hooks/
  useAI.ts
schemas/
  validation.ts
scripts/
  test-tts.ts
services/
  geminiService.ts
store/
  index.ts
  store.test.ts
.gitignore
App.tsx
audio_modal.html
CHANGELOG.md
character_traits.json
index.css
index.html
index.tsx
metadata.json
package.json
postcss.config.cjs
proxy.py
README.md
requirements.txt
tailwind.config.js
tsconfig.json
types.ts
vite.config.ts
```

# Files

## File: components/ErrorBoundary.tsx
````typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Oops, something went wrong!</h2>
            <p className="text-gray-300 mb-4">
              The application encountered an unexpected error.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-indigo-300">Error Details</summary>
                <pre className="mt-2 p-2 bg-gray-800 rounded text-sm overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
````

## File: components/GenreSelect.tsx
````typescript
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
````

## File: components/PlayButton.tsx
````typescript
import React from 'react';
import { PlayIcon, StopIcon } from './Icons';

interface PlayButtonProps {
  onClick: () => void;
  isPlaying: boolean;
}

const PlayButton: React.FC<PlayButtonProps> = ({ onClick, isPlaying }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
      aria-label={isPlaying ? 'Stop' : 'Play'}
    >
      {isPlaying ? (
        <StopIcon className="w-5 h-5" />
      ) : (
        <PlayIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default PlayButton;
````

## File: components/QueryProvider.tsx
````typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && error.message.includes('4')) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};
````

## File: components/TagsInput.tsx
````typescript
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
````

## File: components/ThemeProvider.tsx
````typescript
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
````

## File: components/ThemeToggle.tsx
````typescript
import React from 'react';
import { MoonIcon, SunIcon } from './Icons';
import { useTheme } from './ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-700 transition-colors"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      ) : (
        <MoonIcon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
````

## File: components/VersionHistory.tsx
````typescript
import React from 'react';
import { Character, CharacterVersion } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

interface VersionHistoryProps {
  character: Character;
  onRestore: (version: CharacterVersion) => void;
  currentVersion: number;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ 
  character, 
  onRestore,
  currentVersion
}) => {
  if (!character.versions || character.versions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ClockIcon className="mx-auto h-8 w-8 mb-2" />
        <p>No version history available yet.</p>
        <p className="text-sm">Changes will be saved automatically as you edit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Version History</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {character.versions.map((version) => (
          <div 
            key={version.version} 
            className={`p-3 rounded-lg border ${
              version.version === currentVersion 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-gray-700 hover:bg-gray-700/50'
            } transition-colors`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                    v{version.version}
                  </span>
                  {version.version === currentVersion && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(version.updatedAt), { addSuffix: true })}
                </p>
              </div>
              {version.version !== currentVersion && (
                <button
                  onClick={() => onRestore(version)}
                  className="text-indigo-400 hover:text-indigo-300 p-1 -mr-1"
                  title="Restore this version"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {version.changes && version.changes.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-300 mb-1">Changes:</p>
                <ul className="space-y-1">
                  {version.changes.map((change, idx) => (
                    <li key={idx} className="text-xs text-gray-400 flex items-start">
                      <span className="text-indigo-400 mr-1">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionHistory;
````

## File: components/VoiceManager.tsx
````typescript
import React from 'react';
import { SparklesIcon, UploadIcon } from './Icons';
import Button from './Button';

interface VoiceManagerProps {
  voiceSampleBase64: string | undefined;
  isAiLoading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => void;
  handleGenerateVocalDescription: () => void;
}

const VoiceManager: React.FC<VoiceManagerProps> = ({
  voiceSampleBase64,
  isAiLoading,
  handleFileChange,
  handleGenerateVocalDescription,
}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-medium text-white mb-2">Voice Sample</h3>
      {voiceSampleBase64 && (
        <audio controls src={voiceSampleBase64} className="w-full mb-4" />
      )}
      <div className="flex space-x-2">
        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 transition flex items-center">
          <UploadIcon className="mr-2 h-5 w-5" />
          Upload Audio
          <input
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={(e) => handleFileChange(e, 'audio')}
          />
        </label>
        <Button
          onClick={handleGenerateVocalDescription}
          variant="secondary"
          disabled={isAiLoading || !voiceSampleBase64}
        >
          <SparklesIcon className={`mr-2 h-5 w-5 ${isAiLoading ? 'animate-spin' : ''}`} />
          {isAiLoading ? 'Analyzing...' : 'AI Analyze Voice'}
        </Button>
      </div>
    </div>
  );
};

export default VoiceManager;
````

## File: hooks/useAI.ts
````typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCharacterStore } from '../store';
import {
  fleshOutCharacter,
  generatePortrait,
  generateVocalDescription,
  evolveCharacter,
  textToSpeech
} from '../services/geminiService';
import { PartialCharacter } from '../types';
import toast from 'react-hot-toast';

// Query keys
export const characterKeys = {
  all: ['characters'] as const,
  lists: () => [...characterKeys.all, 'list'] as const,
  list: (filters: string) => [...characterKeys.lists(), { filters }] as const,
  details: () => [...characterKeys.all, 'detail'] as const,
  detail: (id: string) => [...characterKeys.details(), id] as const,
};

// Flesh out character mutation
export const useFleshOutCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (character: PartialCharacter) => fleshOutCharacter(character),
    onSuccess: (result) => {
      if (result.data) {
        // Invalidate and refetch character data if needed
        queryClient.invalidateQueries({ queryKey: characterKeys.all });
        toast.success('Character fleshed out successfully!');
      } else if (result.error) {
        toast.error(`Failed to flesh out character: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error fleshing out character:', error);
      toast.error('Failed to flesh out character');
    },
  });
};

// Generate portrait mutation
export const useGeneratePortrait = () => {
  return useMutation({
    mutationFn: (character: PartialCharacter) => generatePortrait(character),
    onSuccess: (result) => {
      if (result.data) {
        toast.success('Portrait generated successfully!');
      } else if (result.error) {
        toast.error(`Failed to generate portrait: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error generating portrait:', error);
      toast.error('Failed to generate portrait');
    },
  });
};

// Generate vocal description mutation
export const useGenerateVocalDescription = () => {
  return useMutation({
    mutationFn: (base64Audio: string) => generateVocalDescription(base64Audio),
    onSuccess: (result) => {
      if (result.data) {
        toast.success('Vocal description generated successfully!');
      } else if (result.error) {
        toast.error(`Failed to generate vocal description: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error generating vocal description:', error);
      toast.error('Failed to generate vocal description');
    },
  });
};

// Evolve character mutation
export const useEvolveCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ character, prompt }: { character: PartialCharacter; prompt: string }) =>
      evolveCharacter(character, prompt),
    onSuccess: (result) => {
      if (result.data) {
        queryClient.invalidateQueries({ queryKey: characterKeys.all });
        toast.success('Character evolved successfully!');
      } else if (result.error) {
        toast.error(`Failed to evolve character: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error evolving character:', error);
      toast.error('Failed to evolve character');
    },
  });
};

// Text to speech mutation
export const useTextToSpeech = () => {
  return useMutation({
    mutationFn: ({ text, config }: { text: string; config?: any }) =>
      textToSpeech(text, config),
    onSuccess: (result) => {
      if (result.data) {
        toast.success('Audio generated successfully!');
      } else if (result.error) {
        toast.error(`Failed to generate audio: ${result.error}`);
      }
    },
    onError: (error) => {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio');
    },
  });
};
````

## File: schemas/validation.ts
````typescript
import { z } from 'zod';

// Genre validation
export const GenreSchema = z.enum([
  'High Fantasy',
  'Cyberpunk',
  'Post-Apocalyptic',
  'Slice of Life',
  'Mythic',
  'Historical Fiction'
]);

// Character Version schema
export const CharacterVersionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  synopsis: z.string().optional(),
  personality: z.string().optional(),
  flaws: z.string().optional(),
  strengths: z.string().optional(),
  appearance: z.string().optional(),
  backstory: z.string().optional(),
  portraitBase64: z.string().nullable().optional(),
  voiceSampleBase64: z.string().nullable().optional(),
  vocalDescription: z.string().nullable().optional(),
  genre: GenreSchema.optional(),
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
  changes: z.array(z.string()).optional()
});

// Character schema
export const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  synopsis: z.string().optional(),
  personality: z.string().optional(),
  flaws: z.string().optional(),
  strengths: z.string().optional(),
  appearance: z.string().optional(),
  backstory: z.string().optional(),
  portraitBase64: z.string().nullable().optional(),
  voiceSampleBase64: z.string().nullable().optional(),
  vocalDescription: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  currentVersion: z.number().int().positive(),
  versions: z.array(CharacterVersionSchema),
  genre: GenreSchema.optional()
});

// Partial character for updates
export const PartialCharacterSchema = CharacterSchema.partial().omit({
  id: true,
  createdAt: true
});

// API Response schemas
export const CharacterResponseSchema = z.object({
  data: CharacterSchema.nullable(),
  error: z.string().nullable()
});

export const ImageResponseSchema = z.object({
  data: z.string().nullable(),
  error: z.string().nullable()
});

export const TTSResponseSchema = z.object({
  data: z.string().nullable(),
  error: z.string().nullable(),
  provider: z.enum(['google', 'edge'])
});

// Validation functions
export const validateCharacter = (data: unknown) => {
  return CharacterSchema.safeParse(data);
};

export const validatePartialCharacter = (data: unknown) => {
  return PartialCharacterSchema.safeParse(data);
};

export const validateCharacterResponse = (data: unknown) => {
  return CharacterResponseSchema.safeParse(data);
};

export const validateImageResponse = (data: unknown) => {
  return ImageResponseSchema.safeParse(data);
};

export const validateTTSResponse = (data: unknown) => {
  return TTSResponseSchema.safeParse(data);
};
````

## File: CHANGELOG.md
````markdown
# Changelog

All notable changes to The Character Foundry will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Theme Support**: Added light/dark theme toggle with system preference detection
- **Error Boundaries**: Comprehensive error handling with React Error Boundaries
- **Runtime Validation**: Zod schemas for API response validation
- **TanStack Query Integration**: Modern server state management for AI operations
- **Query Provider**: Centralized query management with React Query DevTools
- **Custom AI Hooks**: Dedicated hooks for flesh out, portrait generation, vocal description, and evolution operations
- **Theme Provider**: Context-based theme management with localStorage persistence
- **Theme Toggle Component**: UI component for switching between light and dark themes
- **Validation Schemas**: Zod schemas for Character, Image, and TTS API responses
- **Concurrent Development**: Added `pnpm start` script to run frontend and backend simultaneously

### Changed
- **Dependencies Updated**: All dependencies updated to latest stable versions
  - React: 18.x → 19.2.4
  - TypeScript: 5.x → 5.7.3
  - Vite: 5.x → 6.4.1
  - Tailwind CSS: 3.x → 3.4.19
  - Google GenAI SDK: Updated to latest versions
  - Zustand: 4.x → 4.5.7
  - Added @tanstack/react-query, zod, and other modern libraries
- **Package Manager**: Migrated from npm to pnpm for better performance
- **Build Configuration**: Updated Vite config for modern React 19 features
- **TypeScript Configuration**: Enhanced tsconfig.json with stricter settings
- **State Management**: Improved Zustand store with better type safety
- **Component Architecture**: Added proper error boundaries and context providers
- **API Integration**: Enhanced Gemini service with better error handling and validation

### Fixed
- **TypeScript Errors**: Resolved all compilation errors including missing vocalDescription fields
- **Unused Variables**: Cleaned up unused imports and variables
- **Type Safety**: Improved type definitions and interfaces
- **Build Issues**: Fixed production build errors and warnings
- **Test Suite**: Updated tests to match new component structure

### Technical Improvements
- **Performance**: Optimized bundle size (349KB production build)
- **Developer Experience**: Added comprehensive testing setup with Vitest
- **Code Quality**: Enhanced ESLint configuration and type checking
- **Error Handling**: Added graceful error handling throughout the application
- **State Persistence**: Improved localStorage integration for theme and character data
- **API Reliability**: Added retry logic and better error responses for AI operations

### Documentation
- **README.md**: Comprehensive update with new features, tech stack, and setup instructions
- **Project Structure**: Updated to reflect new directories and components
- **API Documentation**: Enhanced proxy.py comments and endpoint descriptions
- **Development Guide**: Added testing, code quality, and contribution guidelines

## [0.1.0] - Initial Release

### Added
- Basic character creation and management
- AI-powered character generation using Google Gemini API
- Character versioning system
- Portrait and voice sample generation
- Basic UI with React and Tailwind CSS
- Flask backend proxy for API management
- Local storage persistence</content>
<parameter name="filePath">/home/myrqyry/MQR/theCharacterFoundry/CHANGELOG.md
````

## File: metadata.json
````json
{
  "name": "The Character Foundry",
  "description": "An AI-powered, highly detailed character management application built to bring your roleplaying personas to life with exhaustive detail, multimedia integration, and intelligent trait generation.",
  "requestFramePermissions": []
}
````

## File: postcss.config.cjs
````javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
````

## File: requirements.txt
````
flask
python-dotenv
requests
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "allowJs": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    "paths": {
      "@/*" :  ["./*"]
    }
  }
}
````

## File: components/Button.tsx
````typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
}

const Button: React.FC<ButtonProps> = React.memo(({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none px-4 py-2";

  const variantClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
    secondary: "bg-gray-700 text-gray-100 hover:bg-gray-600 focus-visible:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    ghost: "hover:bg-gray-700 hover:text-gray-100",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
````

## File: components/Dashboard.tsx
````typescript
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
````

## File: components/GenerationOptionsModal.tsx
````typescript
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { XIcon } from './Icons';
import { useCharacterStore } from '../store';

// Microsoft Edge TTS voice options
const edgeVoices = [
  // English (US)
  'en-US-GuyNeural', 'en-US-JennyNeural', 'en-US-AriaNeural', 'en-US-DavisNeural', 'en-US-JaneNeural',
  'en-US-JasonNeural', 'en-US-SaraNeural', 'en-US-TonyNeural', 'en-US-NancyNeural', 'en-US-AmberNeural',
  // English (UK)
  'en-GB-LibbyNeural', 'en-GB-RyanNeural', 'en-GB-SoniaNeural', 'en-GB-ThomasNeural',
  // Other languages
  'es-ES-ElviraNeural', 'fr-FR-DeniseNeural', 'de-DE-KatjaNeural', 'it-IT-ElsaNeural',
  'ja-JP-NanamiNeural', 'ko-KR-SunHiNeural', 'pt-BR-FranciscaNeural', 'ru-RU-DariyaNeural',
  'zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural', 'hi-IN-SwaraNeural', 'ar-EG-SalmaNeural'
];

// Google TTS voice options with supported languages
const googleVoices = [
  { name: 'Gemini 2.5 Flash TTS', value: 'gemini-2.5-flash-preview-tts', language: 'en-US' },
  { name: 'Gemini 2.5 Pro TTS', value: 'gemini-2.5-pro-preview-tts', language: 'en-US' },
  { name: 'Neural2-J (US English)', value: 'en-US-Neural2-J', language: 'en-US' },
  { name: 'Wavenet-D (US English)', value: 'en-US-Wavenet-D', language: 'en-US' },
  { name: 'Neural2-A (UK English)', value: 'en-GB-Neural2-A', language: 'en-GB' },
  { name: 'Wavenet-B (UK English)', value: 'en-GB-Wavenet-B', language: 'en-GB' },
  { name: 'Neural2-C (Spanish)', value: 'es-ES-Neural2-C', language: 'es-ES' },
  { name: 'Wavenet-B (French)', value: 'fr-FR-Wavenet-B', language: 'fr-FR' },
  { name: 'Neural2-D (German)', value: 'de-DE-Neural2-D', language: 'de-DE' },
  { name: 'Wavenet-A (Italian)', value: 'it-IT-Wavenet-A', language: 'it-IT' },
  { name: 'Neural2-B (Japanese)', value: 'ja-JP-Neural2-B', language: 'ja-JP' },
  { name: 'Wavenet-A (Korean)', value: 'ko-KR-Wavenet-A', language: 'ko-KR' },
  { name: 'Neural2-B (Portuguese)', value: 'pt-BR-Neural2-B', language: 'pt-BR' },
  { name: 'Wavenet-B (Russian)', value: 'ru-RU-Wavenet-B', language: 'ru-RU' }
];

// Voice styles and roles for Edge TTS
const voiceStyles = [
  { value: 'default', label: 'Default' },
  { value: 'cheerful', label: 'Cheerful' },
  { value: 'sad', label: 'Sad' },
  { value: 'angry', label: 'Angry' },
  { value: 'fearful', label: 'Fearful' },
  { value: 'disgruntled', label: 'Disgruntled' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'excited', label: 'Excited' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'hopeful', label: 'Hopeful' },
  { value: 'shouting', label: 'Shouting' },
  { value: 'terrified', label: 'Terrified' },
  { value: 'unfriendly', label: 'Unfriendly' },
  { value: 'whispering', label: 'Whispering' },
  { value: 'newscast', label: 'Newscast' },
  { value: 'customerservice', label: 'Customer Service' },
  { value: 'chat', label: 'Chat' }
];

// Voice roles for Edge TTS
const voiceRoles = [
  { value: 'default', label: 'Default' },
  { value: 'Boy', label: 'Boy' },
  { value: 'Girl', label: 'Girl' },
  { value: 'YoungAdultMale', label: 'Young Adult Male' },
  { value: 'YoungAdultFemale', label: 'Young Adult Female' },
  { value: 'OlderAdultMale', label: 'Older Adult Male' },
  { value: 'OlderAdultFemale', label: 'Older Adult Female' },
  { value: 'SeniorMale', label: 'Senior Male' },
  { value: 'SeniorFemale', label: 'Senior Female' },
  { value: 'Narrator', label: 'Narrator' }
];

interface GenerationOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GenerationOptionsModal: React.FC<GenerationOptionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    ttsProvider, 
    googleTtsVoice, 
    edgeTtsVoice, 
    textModel, 
    imageModel, 
    setTtsProvider, 
    setGoogleTtsVoice, 
    setEdgeTtsVoice, 
    setTextModel, 
    setImageModel 
  } = useCharacterStore();

  const [currentTtsProvider, setCurrentTtsProvider] = useState(ttsProvider);
  const [currentGoogleTtsVoice, setCurrentGoogleTtsVoice] = useState(googleTtsVoice);
  const [currentEdgeTtsVoice, setCurrentEdgeTtsVoice] = useState(edgeTtsVoice);
  const [currentTextModel, setCurrentTextModel] = useState(textModel);
  const [currentImageModel, setCurrentImageModel] = useState(imageModel);
  const [currentEdgeStyle, setCurrentEdgeStyle] = useState('default');
  const [currentEdgeRole, setCurrentEdgeRole] = useState('default');
  const [currentEdgeRate, setCurrentEdgeRate] = useState('+0%');
  const [currentEdgePitch, setCurrentEdgePitch] = useState('+0Hz');
  const [currentEdgeVolume, setCurrentEdgeVolume] = useState('+0%');

  useEffect(() => {
    setCurrentTtsProvider(ttsProvider);
    setCurrentGoogleTtsVoice(googleTtsVoice);
    setCurrentEdgeTtsVoice(edgeTtsVoice);
    setCurrentTextModel(textModel);
    setCurrentImageModel(imageModel);
    // Load additional settings from localStorage if available
    const savedEdgeStyle = localStorage.getItem('edgeTtsStyle') || 'default';
    const savedEdgeRole = localStorage.getItem('edgeTtsRole') || 'default';
    const savedEdgeRate = localStorage.getItem('edgeTtsRate') || '+0%';
    const savedEdgePitch = localStorage.getItem('edgeTtsPitch') || '+0Hz';
    const savedEdgeVolume = localStorage.getItem('edgeTtsVolume') || '+0%';
    
    setCurrentEdgeStyle(savedEdgeStyle);
    setCurrentEdgeRole(savedEdgeRole);
    setCurrentEdgeRate(savedEdgeRate);
    setCurrentEdgePitch(savedEdgePitch);
    setCurrentEdgeVolume(savedEdgeVolume);
  }, [ttsProvider, googleTtsVoice, edgeTtsVoice, textModel, imageModel]);

  const handleSave = () => {
    setTtsProvider(currentTtsProvider);
    setGoogleTtsVoice(currentGoogleTtsVoice);
    setEdgeTtsVoice(currentEdgeTtsVoice);
    setTextModel(currentTextModel);
    setImageModel(currentImageModel);
    
    // Save Edge TTS settings to localStorage
    if (currentTtsProvider === 'edge') {
      localStorage.setItem('edgeTtsStyle', currentEdgeStyle);
      localStorage.setItem('edgeTtsRole', currentEdgeRole);
      localStorage.setItem('edgeTtsRate', currentEdgeRate);
      localStorage.setItem('edgeTtsPitch', currentEdgePitch);
      localStorage.setItem('edgeTtsVolume', currentEdgeVolume);
    }
    
    onClose();
  };
  
  // Group Google voices by language for better organization
  const googleVoicesByLanguage = googleVoices.reduce((acc, voice) => {
    if (!acc[voice.language]) {
      acc[voice.language] = [];
    }
    acc[voice.language].push(voice);
    return acc;
  }, {} as Record<string, typeof googleVoices>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Generation Options</h2>

        <div className="mb-4">
          <label htmlFor="ttsProvider" className="block text-sm font-medium text-indigo-300 mb-1">TTS Provider</label>
          <select
            id="ttsProvider"
            name="ttsProvider"
            value={currentTtsProvider}
            onChange={(e) => setCurrentTtsProvider(e.target.value as 'google' | 'edge')}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            <option value="google">Google TTS</option>
            <option value="edge">MS Edge TTS</option>
          </select>
        </div>

        {currentTtsProvider === 'google' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="googleTtsVoice" className="block text-sm font-medium text-indigo-300 mb-1">Google TTS Voice</label>
              <select
                id="googleTtsVoice"
                value={currentGoogleTtsVoice}
                onChange={(e) => setCurrentGoogleTtsVoice(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                {Object.entries(googleVoicesByLanguage).map(([language, voices]) => (
                  <optgroup key={language} label={language}>
                    {voices.map((voice) => (
                      <option key={voice.value} value={voice.value}>
                        {voice.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-300 mb-1">Custom Voice (if not listed)</label>
              <input
                type="text"
                value={currentGoogleTtsVoice}
                onChange={(e) => setCurrentGoogleTtsVoice(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="e.g., gemini-2.5-flash-preview-tts"
              />
            </div>
          </div>
        )}

        {currentTtsProvider === 'edge' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="edgeTtsVoice" className="block text-sm font-medium text-indigo-300 mb-1">Voice</label>
              <select
                id="edgeTtsVoice"
                value={currentEdgeTtsVoice}
                onChange={(e) => setCurrentEdgeTtsVoice(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <optgroup label="English (US)">
                  {edgeVoices.filter(v => v.startsWith('en-US')).map(voice => (
                    <option key={voice} value={voice}>
                      {voice.replace('en-US-', '')} (US)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="English (UK)">
                  {edgeVoices.filter(v => v.startsWith('en-GB')).map(voice => (
                    <option key={voice} value={voice}>
                      {voice.replace('en-GB-', '')} (UK)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Languages">
                  {edgeVoices.filter(v => !v.startsWith('en-')).map(voice => {
                    const [lang, , name] = voice.split('-');
                    return (
                      <option key={voice} value={voice}>
                        {name} ({lang.toUpperCase()})
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edgeTtsStyle" className="block text-sm font-medium text-indigo-300 mb-1">Style</label>
                <select
                  id="edgeTtsStyle"
                  value={currentEdgeStyle}
                  onChange={(e) => setCurrentEdgeStyle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {voiceStyles.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edgeTtsRole" className="block text-sm font-medium text-indigo-300 mb-1">Role</label>
                <select
                  id="edgeTtsRole"
                  value={currentEdgeRole}
                  onChange={(e) => setCurrentEdgeRole(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {voiceRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="edgeTtsRate" className="block text-sm font-medium text-indigo-300 mb-1">Rate</label>
                <select
                  id="edgeTtsRate"
                  value={currentEdgeRate}
                  onChange={(e) => setCurrentEdgeRate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {['-50%', '-25%', '+0%', '+25%', '+50%'].map(rate => (
                    <option key={rate} value={rate}>
                      {rate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edgeTtsPitch" className="block text-sm font-medium text-indigo-300 mb-1">Pitch</label>
                <select
                  id="edgeTtsPitch"
                  value={currentEdgePitch}
                  onChange={(e) => setCurrentEdgePitch(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {['-50Hz', '-25Hz', '+0Hz', '+25Hz', '+50Hz'].map(pitch => (
                    <option key={pitch} value={pitch}>
                      {pitch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edgeTtsVolume" className="block text-sm font-medium text-indigo-300 mb-1">Volume</label>
                <select
                  id="edgeTtsVolume"
                  value={currentEdgeVolume}
                  onChange={(e) => setCurrentEdgeVolume(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  {['-50%', '-25%', '+0%', '+25%', '+50%'].map(vol => (
                    <option key={vol} value={vol}>
                      {vol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-2">
              <p>Note: Some voices may not support all styles and roles. The voice will use the closest match.</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="textModel" className="block text-sm font-medium text-indigo-300 mb-1">Text Generation Model</label>
          <input
            id="textModel"
            name="textModel"
            type="text"
            value={currentTextModel}
            onChange={(e) => setCurrentTextModel(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="e.g., gemini-2.5-flash"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="imageModel" className="block text-sm font-medium text-indigo-300 mb-1">Image Generation Model</label>
          <input
            id="imageModel"
            name="imageModel"
            type="text"
            value={currentImageModel}
            onChange={(e) => setCurrentImageModel(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="e.g., gemini-2.0-flash-preview-image-generation"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default GenerationOptionsModal;
````

## File: components/PortraitManager.tsx
````typescript
import React from 'react';
import { SparklesIcon, UserIcon, UploadIcon } from './Icons';
import Button from './Button';

interface PortraitManagerProps {
  portraitBase64: string | undefined;
  isPortraitLoading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => void;
  handleGeneratePortrait: () => void;
}

const PortraitManager: React.FC<PortraitManagerProps> = ({
  portraitBase64,
  isPortraitLoading,
  handleFileChange,
  handleGeneratePortrait,
}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
      {portraitBase64 ? (
        <img
          src={portraitBase64}
          alt="Character portrait"
          className="rounded-lg w-48 h-48 object-cover mb-4"
        />
      ) : (
        <div className="bg-gray-600 border-2 border-dashed border-gray-400 rounded-lg w-48 h-48 flex items-center justify-center mb-4">
          <UserIcon className="h-16 w-16 text-gray-400" />
        </div>
      )}
      <div className="flex space-x-2">
        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 transition flex items-center">
          <UploadIcon className="mr-2 h-5 w-5" />
          Upload Image
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'image')}
          />
        </label>
        <Button
          onClick={handleGeneratePortrait}
          variant="secondary"
          disabled={isPortraitLoading}
        >
          <SparklesIcon className={`mr-2 h-5 w-5 ${isPortraitLoading ? 'animate-spin' : ''}`} />
          {isPortraitLoading ? 'Generating...' : 'AI Generate'}
        </Button>
      </div>
    </div>
  );
};

export default PortraitManager;
````

## File: scripts/test-tts.ts
````typescript
import { config } from 'dotenv';
import { textToSpeech, type TTSConfig } from '../services/geminiService';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envConfig = config({ path: envPath });
  if (envConfig.error) {
    console.warn('Warning: Failed to load .env.local file');
  }
}

// Set API key from GEMINI_API_KEY if not already set
if (!process.env.API_KEY && process.env.GEMINI_API_KEY) {
  process.env.API_KEY = process.env.GEMINI_API_KEY;
}

// Get the current module's directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testTTS(provider: 'google' | 'edge', text: string) {
  console.log(`Testing ${provider.toUpperCase()} TTS with text: "${text}"`);
  
  try {
    const startTime = Date.now();
    const ttsConfig: Partial<TTSConfig> = {
      provider: provider as 'google' | 'edge',
      ...(provider === 'google' ? {
        google: {
          voice: 'en-US-Neural2-J',
          languageCode: 'en-US',
          speakingRate: 1.0,
          pitch: 0.0
        }
      } : {
        edge: {
          voice: 'en-US-JennyNeural',
          rate: '+0%',
          pitch: '0Hz'
        }
      })
    };
    const result = await textToSpeech(text, ttsConfig);

    const duration = Date.now() - startTime;
    
    if (result.error) {
      console.error(`❌ ${provider.toUpperCase()} TTS Error:`, result.error);
      return;
    }

    if (!result.data) {
      console.error(`❌ ${provider.toUpperCase()} TTS returned no data`);
      return;
    }

    // Extract the base64 data
    const base64Data = result.data.split(';base64,').pop();
    if (!base64Data) {
      console.error(`❌ Failed to extract base64 data from ${provider} TTS response`);
      return;
    }

    // Save the audio file
    const extension = provider === 'google' ? 'mp3' : 'webm';
    const filename = `tts-${provider}-${Date.now()}.${extension}`;
    const filepath = join(__dirname, '..', 'test-output', filename);
    
    writeFileSync(filepath, base64Data, 'base64');
    
    console.log(`✅ ${provider.toUpperCase()} TTS Success!`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Audio saved to: ${filepath}`);
    
  } catch (error) {
    console.error(`❌ ${provider.toUpperCase()} TTS Exception:`, error);
  }
}

async function runTests() {
  const testTexts = [
    'Hello, this is a test of the text-to-speech service.',
    'The quick brown fox jumps over the lazy dog.',
    'This implementation supports multiple TTS providers.',
    'Testing with some special characters: 123!@#$%^&*()',
  ];

  const googleApiKey = process.env.API_KEY;
  
  for (const text of testTexts) {
    console.log('\n---\n');
    
    // Only test Google TTS if API key is available
    if (googleApiKey) {
      await testTTS('google', text);
    } else {
      console.log('Skipping Google TTS test (API_KEY not set)');
    }
    
    // Always test edge-tts as it doesn't require an API key
    await testTTS('edge', text);
  }
}

// Create test output directory if it doesn't exist
const testOutputDir = join(process.cwd(), 'test-output');
if (!existsSync(testOutputDir)) {
  mkdirSync(testOutputDir, { recursive: true });
}

// Run the tests
runTests().catch(console.error);
````

## File: audio_modal.html
````html
<!DOCTYPE html>
<html>
<head>
    <title>Audio Clipper</title>
    <style>
        #waveform {
            width: 100%;
            height: 128px;
        }
        #modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
        }
        .modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
        }
    </style>
</head>
<body>

<input type="file" id="audio-upload" accept="audio/*">

<div id="modal">
    <div class="modal-content">
        <h2>Clip Audio</h2>
        <div id="waveform"></div>
        <button id="save-clip">Save Clip</button>
    </div>
</div>

<script src="https://unpkg.com/wavesurfer.js"></script>
<script src="https://unpkg.com/wavesurfer.js/dist/plugin/wavesurfer.regions.min.js"></script>
<script>
    var wavesurfer = null;
    var originalFile = null;

    window.addEventListener('message', function(event) {
        if (event.data.type === 'audioFile') {
            originalFile = event.data.file;
            var modal = document.getElementById('modal');
            modal.style.display = "block";

            if (wavesurfer) {
                wavesurfer.destroy();
            }

            wavesurfer = WaveSurfer.create({
                container: '#waveform',
                waveColor: 'violet',
                progressColor: 'purple',
                plugins: [
                    WaveSurfer.regions.create({
                        regions: [
                            {
                                start: 1,
                                end: 3,
                                color: 'rgba(0, 255, 0, 0.1)'
                            }
                        ],
                        dragSelection: {
                            slop: 5
                        }
                    })
                ]
            });

            wavesurfer.load(URL.createObjectURL(originalFile));
        }
    });

    document.getElementById('save-clip').onclick = function() {
        if (!wavesurfer || !originalFile) return;

        var region = wavesurfer.regions.list[Object.keys(wavesurfer.regions.list)[0]];
        if (region) {
            var start = region.start;
            var end = region.end;

            var originalBuffer = wavesurfer.backend.buffer;
            var duration = end - start;

            var clippedBuffer = wavesurfer.backend.ac.createBuffer(
                originalBuffer.numberOfChannels,
                originalBuffer.sampleRate * duration,
                originalBuffer.sampleRate
            );

            for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
                var channelData = originalBuffer.getChannelData(i);
                var clippedChannelData = clippedBuffer.getChannelData(i);
                var startSample = Math.floor(start * originalBuffer.sampleRate);

                for (var j = 0; j < clippedChannelData.length; j++) {
                    clippedChannelData[j] = channelData[startSample + j];
                }
            }

            var wavBlob = audioBufferToWav(clippedBuffer);

            var reader = new FileReader();
            reader.onloadend = function() {
                var base64data = reader.result;
                var event = new CustomEvent('audioClipped', { detail: base64data });
                window.parent.document.dispatchEvent(event);

                document.getElementById('modal').style.display = "none";
                wavesurfer.destroy();
            };
            reader.readAsDataURL(wavBlob);
        }
    };

    function audioBufferToWav(buffer) {
        var numOfChan = buffer.numberOfChannels,
            btwLength = buffer.length * numOfChan * 2 + 44,
            btwArrBuff = new ArrayBuffer(btwLength),
            btwView = new DataView(btwArrBuff),
            btwOffset = 0;

        function writeString(view, offset, string) {
            for (var i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        function floatTo16BitPCM(output, offset, input) {
            for (var i = 0; i < input.length; i++, offset += 2) {
                var s = Math.max(-1, Math.min(1, input[i]));
                output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        }

        writeString(btwView, btwOffset, 'RIFF'); btwOffset += 4;
        btwView.setUint32(btwOffset, btwLength - 8, true); btwOffset += 4;
        writeString(btwView, btwOffset, 'WAVE'); btwOffset += 4;
        btwView.setUint32(btwOffset, 16, true); btwOffset += 4;
        btwView.setUint16(btwOffset, 1, true); btwOffset += 2;
        btwView.setUint16(btwOffset, numOfChan, true); btwOffset += 2;
        btwView.setUint32(btwOffset, buffer.sampleRate, true); btwOffset += 4;
        btwView.setUint32(btwOffset, buffer.sampleRate * numOfChan * 2, true); btwOffset += 4;
        btwView.setUint16(btwOffset, numOfChan * 2, true); btwOffset += 2;
        btwView.setUint16(btwOffset, 16, true); btwOffset += 2;
        writeString(btwView, btwOffset, 'data'); btwOffset += 4;
        btwView.setUint32(btwOffset, btwLength - btwOffset - 4, true); btwOffset += 4;

        floatTo16BitPCM(btwView, btwOffset, buffer.getChannelData(0));

        return new Blob([btwArrBuff], { type: 'audio/wav' });
    }
</script>

</body>
</html>
````

## File: character_traits.json
````json
{
  "characterTraits": {
    "core": {
      "title": "Core Information",
      "description": "The essential details about your character.",
      "fields": [
        {"name": "name", "type": "text", "label": "Name"},
        {"name": "title", "type": "text", "label": "Title"},
        {"name": "genre", "type": "genre", "label": "Genre"},
        {"name": "synopsis", "type": "textarea", "label": "Synopsis"}
      ]
    },
    "physical": {
      "title": "Physical Traits",
      "description": "Define the physical appearance of your character.",
      "fields": [
        {"name": "height", "type": "text", "label": "Height"},
        {"name": "weight", "type": "text", "label": "Weight"},
        {"name": "hairColor", "type": "color", "label": "Hair Color"},
        {"name": "eyeColor", "type": "color", "label": "Eye Color"},
        {"name": "skinTone", "type": "text", "label": "Skin Tone"},
        {"name": "build", "type": "select", "options": ["Slender", "Athletic", "Stocky", "Muscular", "Curvy"], "label": "Body Build"},
        {"name": "scars", "type": "textarea", "label": "Scars & Markings"},
        {"name": "tattoos", "type": "textarea", "label": "Tattoos & Piercings"},
        {"name": "clothingStyle", "type": "text", "label": "Clothing Style"}
      ]
    },
    "vocal": {
      "title": "Vocal Traits",
      "description": "Define the sound of your character's voice. Upload a short audio clip for Gemini to analyze.",
      "fields": [
        {"name": "audioSample", "type": "file", "label": "Vocal Sample (WAV, MP3)"},
        {"name": "pitch", "type": "select", "options": ["Very High", "High", "Medium", "Low", "Very Low"], "label": "Pitch"},
        {"name": "tone", "type": "text", "label": "Tone (e.g., Raspy, Smooth, Gravelly)"},
        {"name": "accent", "type": "text", "label": "Accent"},
        {"name": "speechPatterns", "type": "textarea", "label": "Speech Patterns (e.g., stutters, uses slang)"}
      ],
      "geminiNote": "Upload a short audio clip (a few seconds) of the desired voice. Gemini will analyze the audio to understand the vocal characteristics."
    },
    "personality": {
      "title": "Personality Traits",
      "description": "Define the core personality of your character.",
      "fields": [
        {"name": "alignment", "type": "select", "options": ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"], "label": "Alignment"},
        {"name": "virtues", "type": "tags", "label": "Virtues (e.g., Honest, Brave, Loyal)"},
        {"name": "vices", "type": "tags", "label": "Vices (e.g., Greedy, Arrogant, Impulsive)"},
        {"name": "quirks", "type": "textarea", "label": "Quirks & Habits"},
        {"name": "fears", "type": "textarea", "label": "Fears & Phobias"}
      ]
    },
    "background": {
      "title": "Background & History",
      "description": "Detail your character's past.",
      "fields": [
        {"name": "hometown", "type": "text", "label": "Hometown"},
        {"name": "family", "type": "textarea", "label": "Family & Relationships"},
        {"name": "education", "type": "textarea", "label": "Education & Occupation"},
        {"name": "majorLifeEvents", "type": "textarea", "label": "Major Life Events"}
      ]
    },
    "favorites": {
      "title": "Favorites",
      "description": "What does your character love?",
      "fields": [
        {"name": "favoriteFood", "type": "text", "label": "Favorite Food"},
        {"name": "favoriteColor", "type": "color", "label": "Favorite Color"},
        {"name": "favoriteMusic", "type": "text", "label": "Favorite Music Genre"},
        {"name": "favoriteBook", "type": "text", "label": "Favorite Book/Movie"},
        {"name": "hobby", "type": "text", "label": "Hobby"}
      ]
    },
    "skills": {
      "title": "Skills & Abilities",
      "description": "What can your character do?",
      "fields": [
        {"name": "combatSkills", "type": "tags", "label": "Combat Skills"},
        {"name": "magicAbilities", "type": "tags", "label": "Magic & Supernatural Abilities"},
        {"name": "practicalSkills", "type": "tags", "label": "Practical Skills (e.g., Cooking, Lockpicking)"},
        {"name": "languages", "type": "tags", "label": "Languages Spoken"}
      ]
    }
  }
}
````

## File: index.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Light theme overrides */
.light {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-accent: #3b82f6;
  --border: #e2e8f0;
}

.light body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.light .bg-gray-900 {
  background-color: var(--bg-primary);
}

.light .bg-gray-800 {
  background-color: var(--bg-secondary);
}

.light .bg-gray-700 {
  background-color: var(--bg-tertiary);
}

.light .text-gray-100 {
  color: var(--text-primary);
}

.light .text-gray-300 {
  color: var(--text-secondary);
}

.light .text-indigo-400 {
  color: var(--text-accent);
}

.light .border-gray-700 {
  border-color: var(--border);
}

.light .border-gray-600 {
  border-color: var(--border);
}

/* Custom styles can be added below */
````

## File: index.html
````html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Character Foundry</title>
    <style>
      /* Custom scrollbar for a more thematic feel */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: #1f2937; /* gray-800 */
      }
      ::-webkit-scrollbar-thumb {
        background: #4b5563; /* gray-600 */
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #6b7280; /* gray-500 */
      }
    </style>
    <link rel="stylesheet" href="/index.css">
  </head>
  <body class="bg-gray-900 text-gray-100">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
````

## File: index.tsx
````typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { QueryProvider } from './components/QueryProvider';
import { ThemeProvider } from './components/ThemeProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <App />
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
````

## File: tailwind.config.js
````javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{ts,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
````

## File: components/CharacterFields.tsx
````typescript
import React from 'react';
import { InputField, TextareaField } from './CharacterForm'; // Assuming InputField and TextareaField are exported from CharacterForm
import { UploadIcon } from './Icons';
import characterTraits from '../character_traits.json';

import GenreSelect from './GenreSelect';
import { Genre } from '../types';
import TagsInput from './TagsInput';

interface CharacterFieldsProps {
  character: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => void;
  handleGenreChange: (genre: Genre) => void;
  genres: Genre[];
}

const CharacterFields: React.FC<CharacterFieldsProps> = ({ character, handleChange, handleFileChange, handleGenreChange, genres }) => {
  const renderField = (field: any) => {
    const { name, type, label, options } = field;
    const value = character[name] || '';

    switch (type) {
      case 'text':
      case 'color':
        return <InputField key={name} label={label} id={name} name={name} type={type} value={value || '#000000'} onChange={handleChange} />;
      case 'textarea':
        return <TextareaField key={name} label={label} id={name} name={name} value={value} onChange={handleChange} />;
      case 'genre':
        return <GenreSelect key={name} value={character.genre} onChange={handleGenreChange} genres={genres} />;
      case 'select':
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
              {options.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      case 'tags':
        return <TagsInput key={name} label={label} name={name} value={Array.isArray(value) ? value : (value ? value.split(',').map((s: string) => s.trim()) : [])} onChange={(name, value) => handleChange({ target: { name, value } } as any)} />;
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
      {Object.entries(characterTraits.characterTraits).map(([sectionKey, section]) => (
        <div key={sectionKey} className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">{section.title}</h3>
          <p className="text-sm text-gray-400 mb-4">{section.description}</p>
          <div className="space-y-4">
            {section.fields.map(field => renderField(field))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CharacterFields;
````

## File: components/ImportExportMenu.tsx
````typescript
import React, { useCallback, useRef } from 'react';
import { Character } from '../types';
import Button from './Button';
import { DownloadIcon, UploadIcon } from './Icons';
import { useCharacterActions } from '../store';

interface ImportExportMenuProps {
  character: Partial<Character>;
}

const ImportExportMenu: React.FC<ImportExportMenuProps> = ({ character }) => {
  const { importCharacters } = useCharacterActions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify([character], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${character.name?.replace(/\s+/g, '_') || 'character'}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [character]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const importedCharacters: Character[] = JSON.parse(text);
            importCharacters(importedCharacters);
            alert(`${importedCharacters.length} character(s) imported successfully!`);
          }
        } catch (error) {
          console.error("Failed to parse imported JSON:", error);
          alert("Failed to import characters. Please ensure the file is a valid JSON export.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleExport} variant="secondary">
        <DownloadIcon className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button onClick={handleImportClick} variant="secondary">
        <UploadIcon className="mr-2 h-4 w-4" />
        Import
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileImport}
      />
    </div>
  );
};

export default ImportExportMenu;
````

## File: store/store.test.ts
````typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from './index';
import { Character, Genre } from '../types';

// Helper function to create a test character
const createTestCharacter = (overrides: Partial<Character> = {}): Character => ({
  id: 'test-id',
  name: 'Test Character',
  title: 'Test Title',
  synopsis: 'Test synopsis',
  personality: 'Test personality',
  flaws: 'Test flaws',
  strengths: 'Test strengths',
  appearance: 'Test appearance',
  backstory: 'Test backstory',
  portraitBase64: null,
  voiceSampleBase64: null,
  vocalDescription: null,
  genre: 'High Fantasy',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentVersion: 1,
  versions: [],
  ...overrides
});

describe('Character Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCharacterStore.setState({
      characters: [],
      currentView: 0,
      editingCharacterId: null,
      genres: ['High Fantasy', 'Cyberpunk', 'Post-Apocalyptic', 'Slice of Life', 'Mythic', 'Historical Fiction']
    });
  });

  it('should add a character', () => {
    const store = useCharacterStore.getState();
    const characterData = {
      name: 'New Character',
      title: 'New Title',
      synopsis: 'New synopsis',
      personality: 'New personality',
      flaws: 'New flaws',
      strengths: 'New strengths',
      appearance: 'New appearance',
      backstory: 'New backstory',
      portraitBase64: null,
      voiceSampleBase64: null,
      vocalDescription: null,
      genre: 'Cyberpunk' as Genre
    };

    store.addCharacter(characterData);
    
    const state = useCharacterStore.getState();
    expect(state.characters).toHaveLength(1);
    expect(state.characters[0].name).toBe('New Character');
    expect(state.characters[0].currentVersion).toBe(1);
  });

  it('should update a character', () => {
    const store = useCharacterStore.getState();
    const character = createTestCharacter();
    
    // Add the character first
    store.characters = [character];
    
    // Update the character
    const updatedCharacter = store.updateCharacter(character.id, {
      name: 'Updated Name',
      title: 'Updated Title'
    });
    
    expect(updatedCharacter).not.toBeNull();
    expect(updatedCharacter?.name).toBe('Updated Name');
    expect(updatedCharacter?.title).toBe('Updated Title');
    expect(updatedCharacter?.currentVersion).toBe(2);
    
    // Check that a version was created
    const state = useCharacterStore.getState();
    const updatedChar = state.characters.find(c => c.id === character.id);
    expect(updatedChar?.versions).toHaveLength(1);
    expect(updatedChar?.versions[0].version).toBe(1);
  });

  it('should delete a character', () => {
    const store = useCharacterStore.getState();
    const character = createTestCharacter();
    
    // Add the character first
    store.characters = [character];
    
    // Delete the character
    store.deleteCharacter(character.id);
    
    const state = useCharacterStore.getState();
    expect(state.characters).toHaveLength(0);
  });

  it('should get character versions', () => {
    const store = useCharacterStore.getState();
    const character = createTestCharacter({
      currentVersion: 3,
      versions: [
        { 
          name: 'Test Character',
          title: 'Test Title',
          synopsis: 'Test synopsis',
          personality: 'Test personality',
          flaws: 'Test flaws',
          strengths: 'Test strengths',
          appearance: 'Test appearance',
          backstory: 'Test backstory',
          portraitBase64: null,
          voiceSampleBase64: null,
          vocalDescription: null,
          genre: 'High Fantasy',
          version: 1,
          updatedAt: new Date().toISOString(),
          changes: ['Initial version']
        },
        { 
          name: 'Test Character',
          title: 'Test Title',
          synopsis: 'Updated synopsis',
          personality: 'Test personality',
          flaws: 'Test flaws',
          strengths: 'Test strengths',
          appearance: 'Test appearance',
          backstory: 'Test backstory',
          portraitBase64: null,
          voiceSampleBase64: null,
          vocalDescription: null,
          genre: 'High Fantasy',
          version: 2,
          updatedAt: new Date().toISOString(),
          changes: ['Updated synopsis']
        }
      ]
    });
    
    // Add the character first
    store.characters = [character];
    
    // Get versions
    const versions = store.getCharacterVersions(character.id);
    expect(versions).toHaveLength(3); // 2 versions + current version
    
    // Check that versions are sorted in descending order
    expect(versions[0].version).toBe(3); // Current version
    expect(versions[1].version).toBe(2);
    expect(versions[2].version).toBe(1);
    
    // Test getting a specific version
    const version1 = store.getCharacterVersion(character.id, 1);
    expect(version1).not.toBeNull();
    expect(version1?.version).toBe(1);
    
    const currentVersion = store.getCharacterVersion(character.id, 3);
    expect(currentVersion).not.toBeNull();
    expect(currentVersion?.version).toBe(3);
  });

  it('should restore a character version', () => {
    const store = useCharacterStore.getState();
    const character = createTestCharacter({
      currentVersion: 2,
      versions: [
        { 
          name: 'Old Name',
          title: 'Old Title',
          synopsis: 'Old synopsis',
          personality: 'Test personality',
          flaws: 'Test flaws',
          strengths: 'Test strengths',
          appearance: 'Test appearance',
          backstory: 'Test backstory',
          portraitBase64: null,
          voiceSampleBase64: null,
          vocalDescription: null,
          genre: 'High Fantasy',
          version: 1,
          updatedAt: new Date().toISOString(),
          changes: ['Initial version']
        }
      ]
    });
    
    // Add the character first
    store.characters = [character];
    
    // Restore version 1
    const restoredCharacter = store.restoreCharacterVersion(character.id, 1);
    
    expect(restoredCharacter).not.toBeNull();
    expect(restoredCharacter?.name).toBe('Old Name');
    expect(restoredCharacter?.currentVersion).toBe(3); // Should increment version
    
    // Check that a new version was created
    const state = useCharacterStore.getState();
    const updatedChar = state.characters.find(c => c.id === character.id);
    expect(updatedChar?.versions).toHaveLength(2);
    expect(updatedChar?.versions[1].version).toBe(3);
    expect(updatedChar?.versions[1].changes).toContain('Restored from version 1');
  });

  it('should import characters', () => {
    const store = useCharacterStore.getState();
    
    // Add an existing character
    const existingChar = createTestCharacter({ id: 'existing-id', name: 'Existing Character' });
    store.characters = [existingChar];
    
    // Import new characters (one with existing ID, one new)
    const newChar1 = createTestCharacter({ id: 'existing-id', name: 'Updated Character' });
    const newChar2 = createTestCharacter({ id: 'new-id', name: 'New Character' });
    
    store.importCharacters([newChar1, newChar2]);
    
    const state = useCharacterStore.getState();
    expect(state.characters).toHaveLength(2); // Should not add duplicate ID
    
    // Existing character should not be updated
    expect(state.characters.find(c => c.id === 'existing-id')?.name).toBe('Existing Character');
    // New character should be added
    expect(state.characters.find(c => c.id === 'new-id')?.name).toBe('New Character');
  });
});
````

## File: proxy.py
````python
import os
import requests
import base64
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import edge_tts
import asyncio
import tempfile

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Load API keys from environment variables
OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_TTS_API_KEY = os.getenv("GOOGLE_TTS_API_KEY") or GEMINI_API_KEY  # Use Gemini key as fallback

# Define API endpoints
OPENWEATHERMAP_API_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather"
GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
GOOGLE_TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize"

@app.route('/proxy/<api_name>', methods=['GET'])
def proxy(api_name):
    if api_name == 'openweathermap':
        api_key = OPENWEATHERMAP_API_KEY
        api_url = OPENWEATHERMAP_API_ENDPOINT
    else:
        return jsonify({"error": "Unknown API"}), 404

    # Add the API key to the query parameters for OpenWeatherMap
    params = request.args.to_dict()
    params['appid'] = api_key

    headers = {
        'Content-Type': 'application/json'
    }

    # Forward the request to the third-party API
    try:
        resp = requests.get(api_url, headers=headers, params=params)
        resp.raise_for_status()  # Raise an exception for bad status codes
        return jsonify(resp.json()), resp.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/gemini/generate', methods=['POST'])
def gemini_generate():
    """Proxy for Gemini text generation"""
    if not GEMINI_API_KEY:
        return jsonify({"error": "Gemini API key not configured"}), 500
    
    try:
        data = request.get_json()
        model = data.get('model', 'gemini-2.0-flash-exp')
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        url = f"{GEMINI_API_ENDPOINT}/{model}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/gemini/generate-image', methods=['POST'])
def gemini_generate_image():
    """Proxy for Gemini image generation"""
    if not GEMINI_API_KEY:
        return jsonify({"error": "Gemini API key not configured"}), 500
    
    try:
        data = request.get_json()
        model = data.get('model', 'gemini-pro-vision')
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        url = f"{GEMINI_API_ENDPOINT}/{model}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/imagen/generate', methods=['POST'])
def generate_image_imagen():
    """Proxy for Imagen 3 Image Generation"""
    data = request.json
    print(f"Incoming request data to /api/imagen/generate: {data}")
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'error': 'GEMINI_API_KEY not set'}), 500

    model = 'gemini-2.0-flash-preview-image-generation' # Correct model for this task
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}'
    headers = {'Content-Type': 'application/json'}
    payload = {
        'contents': [
            {
                'parts': [
                    {'text': prompt}
                ]
            }
        ],
        'generationConfig': {
            'responseMimeType': 'image/png'
        }
    }
    print(f"Sending request to Gemini API. URL: {url}, Payload: {payload}")

    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Received response from Gemini API. Status: {response.status_code}, Content: {response.text}")
        response.raise_for_status()
        image_data = response.json()

        if 'candidates' in image_data and len(image_data['candidates']) > 0:
            # The image is expected in the first part of the response
            part = image_data['candidates'][0]['content']['parts'][0]
            if 'inlineData' in part and part['inlineData']['mimeType'].startswith('image/'):
                base64_image = part['inlineData']['data']
                image_bytes = base64.b64decode(base64_image)
                
                image_dir = 'public/portraits'
                if not os.path.exists(image_dir):
                    os.makedirs(image_dir)
                
                image_filename = f'{uuid.uuid4()}.png'
                image_path = os.path.join(image_dir, image_filename)
                
                with open(image_path, 'wb') as f:
                    f.write(image_bytes)
                
                return jsonify({'imageUrl': f'/portraits/{image_filename}'})

        return jsonify({'error': 'No image data received from API'}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Gemini API request error: {e}'}), 500


@app.route('/api/tts/google', methods=['POST'])
def google_tts():
    """Proxy for Gemini 2.5 Text-to-Speech"""
    if not GOOGLE_TTS_API_KEY:
        return jsonify({"error": "Google TTS API key not configured"}), 500

    try:
        data = request.get_json()
        text = data.get('text')
        voice_name = data.get('voice_name', 'Kore')  # Default to a known voice

        if not text:
            return jsonify({"error": "Text is required"}), 400

        model = "gemini-2.5-flash-preview-tts"
        url = f"{GEMINI_API_ENDPOINT}/{model}:generateContent?key={GOOGLE_TTS_API_KEY}"

        payload = {
            "contents": {"parts": [{"text": text}]},
            "generationConfig": {
                "responseMimeType": "audio/mpeg"
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"
                }
            ]
        }

        headers = {
            'Content-Type': 'application/json'
        }

        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()

        result = response.json()
        
        # Extract base64 audio content from the new response structure
        if 'candidates' in result and len(result['candidates']) > 0:
            content = result['candidates'][0].get('content', {})
            parts = content.get('parts', [])
            if len(parts) > 0 and 'audio' in parts[0]:
                audio_content = parts[0]['audio']['data']
                return jsonify({
                    'audioContent': audio_content,
                    'mimeType': 'audio/mp3'
                })

        return jsonify({"error": "No audio content in response"}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Google TTS API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/tts/edge', methods=['POST'])
def edge_tts_proxy():
    """Proxy for Edge TTS"""
    try:
        data = request.get_json()
        text = data.get('text')
        voice = data.get('voice', 'en-US-GuyNeural')
        rate = data.get('rate', '+0%')
        pitch = data.get('pitch', '+0Hz')
        volume = data.get('volume', '+0%')

        if not text:
            return jsonify({"error": "Text is required"}), 400

        async def generate_speech():
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmpfile:
                filepath = tmpfile.name

            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, volume=volume)
            await communicate.save(filepath)
            return filepath

        # Run the async function in the current thread
        filepath = asyncio.run(generate_speech())

        with open(filepath, 'rb') as f:
            audio_content = base64.b64encode(f.read()).decode('utf-8')
        
        os.remove(filepath)  # Clean up the temporary file

        return jsonify({
            'audioContent': audio_content,
            'mimeType': 'audio/mp3'
        })

    except Exception as e:
        return jsonify({"error": f"Edge TTS proxy error: {str(e)}"}), 500

if __name__ == '__main__':
    # Using a port in the ephemeral range
    app.run(debug=True, port=49152)
````

## File: README.md
````markdown
# The Character Foundry

## Project Description

The Character Foundry is a modern web application designed to help users create and manage detailed fictional characters using AI assistance. It leverages Google's Gemini API to generate rich character profiles, backstories, personality traits, and physical descriptions, streamlining the creative process for writers, game developers, and role-playing enthusiasts.

The application features a React-based frontend with TypeScript, a Flask backend proxy for API management, and comprehensive state management with Zustand and TanStack Query.

## Key Features

*   **AI-Powered Character Generation**: Utilize the Gemini API to generate detailed character profiles, including names, backstories, personality traits, and physical descriptions.
*   **Character Profile Management**: Create, edit, and organize multiple character profiles with version history.
*   **Version Control**: Track character changes over time with automatic versioning and the ability to restore previous versions.
*   **Portrait Generation**: Generate character portraits using Gemini's image generation capabilities.
*   **Voice Generation**: Create character voice samples using Google TTS and Edge TTS providers.
*   **Vocal Description Analysis**: Analyze voice samples to generate detailed vocal descriptions.
*   **Theme Support**: Toggle between light and dark themes with system preference detection.
*   **Intuitive User Interface**: Built with React, styled with Tailwind CSS, and enhanced with shadcn/ui components.
*   **Real-time Validation**: Runtime validation using Zod schemas for data integrity.
*   **Error Boundaries**: Comprehensive error handling with React Error Boundaries.
*   **Responsive Design**: Mobile-friendly interface that works across all devices.
*   **API Integration**: Seamless integration with Google's Generative AI, Google TTS, and Edge TTS APIs.

## Tech Stack

*   **Frontend Framework**: React 19.2.4
*   **Language**: TypeScript 5.7.3
*   **Build Tool**: Vite 6.4.1
*   **Styling**: Tailwind CSS 3.4.19 + shadcn/ui
*   **State Management**: Zustand 4.5.7 + TanStack Query 5.x
*   **Backend**: Flask (Python proxy server)
*   **Validation**: Zod
*   **AI Integration**: Google Gemini API (@google/genai, @google/generative-ai)
*   **Package Manager**: pnpm
*   **Testing**: Vitest 3.2.4 + React Testing Library
*   **Development Tools**: ESLint, TypeScript, Hot Module Replacement

## Project Structure

```
the-character-foundry/
├── components/           # React components
│   ├── ErrorBoundary.tsx # Error boundary component
│   ├── Icons.tsx         # Icon components
│   ├── QueryProvider.tsx # TanStack Query provider
│   ├── ThemeProvider.tsx # Theme context provider
│   ├── ThemeToggle.tsx   # Theme toggle component
│   └── ...               # Other UI components
├── hooks/                # Custom React hooks
│   └── useAI.ts          # AI operation hooks
├── schemas/              # Validation schemas
│   └── validation.ts     # Zod validation schemas
├── services/             # API service layer
│   └── geminiService.ts  # Gemini API integration
├── store/                # State management
│   └── index.ts          # Zustand store
├── types.ts              # TypeScript type definitions
├── proxy.py              # Flask backend proxy
├── requirements.txt      # Python dependencies
└── package.json          # Node.js dependencies
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.8+ with pip
- Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone the repository

```bash
git clone https://github.com/myrqyry/character-foundry.git
cd character-foundry
```

### 2. Install frontend dependencies

```bash
pnpm install
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create `.env.local` in the root directory with your API keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENWEATHERMAP_API_KEY=your_openweathermap_key_here
```

### 5. Start the development servers

The application uses concurrently to run both frontend and backend:

```bash
pnpm start
```

This will start:
- Frontend development server on `http://localhost:5173`
- Backend proxy server on `http://localhost:49152`

### Alternative: Manual startup

**Terminal 1 - Backend:**
```bash
python proxy.py
```

**Terminal 2 - Frontend:**
```bash
pnpm dev
```

## Usage Instructions

1. **Access the Application**: Open `http://localhost:5173` in your browser.

2. **Create Characters**:
   - Click "Create New Character" to start building a character profile
   - Fill in basic details (name, title, synopsis)
   - Use AI features to flesh out personality, flaws, strengths, and backstory
   - Generate portraits and voice samples

3. **AI Enhancement Features**:
   - **Flesh Out**: Generate complete character details from partial information
   - **Evolve Character**: Make targeted changes using natural language prompts
   - **Generate Portrait**: Create visual representations using AI image generation
   - **Voice Analysis**: Upload audio samples and generate vocal descriptions

4. **Version History**:
   - All character changes are automatically versioned
   - View change history and restore previous versions
   - Compare different iterations of your characters

5. **Theme Toggle**:
   - Click the sun/moon icon in the header to switch between light and dark themes
   - Theme preference is automatically saved

6. **Import/Export**:
   - Export individual characters or entire collections
   - Import characters from JSON files
   - Share character profiles across projects

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm start            # Start both frontend and backend concurrently

# Building
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage

# Code Quality
pnpm type-check       # Run TypeScript type checking
```

### Testing

The project uses Vitest for unit testing with React Testing Library:

```bash
pnpm test:coverage
```

Tests cover:
- Store logic and state management
- Component rendering and interactions
- API service functions
- Validation schemas

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (via ESLint)
- **Error Boundaries**: Runtime error handling
- **Zod Validation**: Runtime data validation

## API Integration

The application integrates with multiple APIs:

- **Google Gemini API**: Text generation, image generation, voice analysis
- **Google TTS API**: Text-to-speech generation
- **Edge TTS API**: Alternative TTS provider
- **OpenWeatherMap API**: Weather data integration (future feature)

All API calls are proxied through the Flask backend for security and rate limiting.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests
4. Run the test suite: `pnpm test`
5. Commit your changes: `git commit -m 'feat: add your feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Powered by [Google Gemini API](https://ai.google.dev/gemini-api)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/) and [TanStack Query](https://tanstack.com/query)
- Icons from [Heroicons](https://heroicons.com/)
````

## File: vite.config.ts
````typescript
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
    return {
      build: {
        rollupOptions: {
          external: ['react-hot-toast'],
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
````

## File: components/Icons.tsx
````typescript
import React from 'react';

interface IconProps {
    className?: string;
}

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9.94 14.34l-2.28-2.28a1.41 1.41 0 0 0-2 2l2.28 2.28" />
        <path d="m14 4-2.28 2.28a1.41 1.41 0 0 0 2 2L16 6" />
        <path d="M18 10l-2.28 2.28a1.41 1.41 0 0 0 2 2L20 12" />
        <path d="m4 14 2.28-2.28a1.41 1.41 0 0 1 2 2L6 16" />
        <path d="M14.34 9.94 12.06 7.66" />
        <path d="M4 4h.01" /><path d="M10 4h.01" /><path d="M4 10h.01" /><path d="M20 20h.01" />
        <path d="M14 20h.01" /><path d="M20 14h.01" /><path d="M12.06 16.34l-2.34 2.34" />
        <path d="M16.34 12.06 14.06 9.78" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

export const StopIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

export const XIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 .33-1.82l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1 1.51H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);
````

## File: .gitignore
````
# Environment variables
.env
.env.development
.env.production
.env.test
.env.local
.env.*.local

# Build outputs
dist/
dist-ssr/
build/
out/

# Dependencies
node_modules/
.pnpm-store/
.pnpm-debug.log*

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/
.venv
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis

# Testing
coverage/
.nyc_output/
test-output/
*.lcov

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
lib-cov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# TypeScript cache
*.tsbuildinfo

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# IDE and OS files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
.DS_Store
Thumbs.db
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Temporary files
*.tmp
*.temp
*.bak
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~

# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent

# JetBrains IDEs
.idea/
*.iml
*.ipr
*.iws

# VS Code
.vscode/
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# Local Netlify folder
.netlify

# Vercel
.vercel

# Storybook build outputs
.out
.storybook-out
storybook-static

# Temporary folders
tmp/
temp/

# Audio/Video files (if generated)
*.mp3
*.wav
*.mp4
*.avi

# Database files
*.db
*.sqlite
*.sqlite3

# Certificate files
*.pem
*.key
*.crt

# Backup files
*.backup
*.bak

# Lock files (keep package-lock.json and yarn.lock)
# package-lock.json is kept for npm
# yarn.lock is kept for yarn
# pnpm-lock.yaml is kept for pnpm
AGENTS.md
````

## File: types.ts
````typescript
export type Genre = 'High Fantasy' | 'Cyberpunk' | 'Post-Apocalyptic' | 'Slice of Life' | 'Mythic' | 'Historical Fiction';

export interface CharacterVersion {
  name: string;
  title: string;
  synopsis: string;
  personality: string;
  flaws: string;
  strengths: string;
  appearance: string;
  backstory: string;
  portraitBase64: string | null;
  voiceSampleBase64: string | null;
  vocalDescription: string | null;
  genre?: Genre;
  version: number;
  updatedAt: string;
  changes?: string[];
}

export interface Character {
  id: string;
  name: string;
  title: string;
  synopsis: string;
  personality: string;
  flaws: string;
  strengths: string;
  appearance: string;
  backstory: string;
  portraitBase64: string | null;
  voiceSampleBase64: string | null;
  vocalDescription: string | null;
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
  versions: CharacterVersion[];
  genre?: Genre;
}

export type PartialCharacter = Omit<Character, 'id' | 'createdAt'>;

export enum View {
  Dashboard,
  Editor,
}
````

## File: store/index.ts
````typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Character, Genre, View, CharacterVersion } from '../types';

const MAX_VERSIONS = 10; // Maximum number of versions to keep per character

// Helper function to detect changes between character versions
function getChanges(oldChar: Character, updates: Partial<Character>): string[] {
  const changes: string[] = [];
  const fields: (keyof Character)[] = [
    'name', 'title', 'synopsis', 'personality', 'flaws',
    'strengths', 'appearance', 'backstory', 'genre', 'vocalDescription'
  ];

  for (const field of fields) {
    if (field in updates && updates[field] !== oldChar[field]) {
      changes.push(`Updated ${field}`);
    }
  }

  if ('portraitBase64' in updates && updates.portraitBase64 !== oldChar.portraitBase64) {
    changes.push('Updated portrait');
  }

  if ('voiceSampleBase64' in updates && updates.voiceSampleBase64 !== oldChar.voiceSampleBase64) {
    changes.push('Updated voice sample');
  }

  if ('vocalDescription' in updates && updates.vocalDescription !== oldChar.vocalDescription) {
    changes.push('Updated vocal description');
  }

  return changes.length > 0 ? changes : ['No specific changes detected'];
}

// Define the store state and actions
type StoreState = {
  // State
  characters: Character[];
  currentView: View;
  editingCharacterId: string | null;
  genres: Genre[];
  ttsProvider: 'google' | 'edge';
  googleTtsVoice: string;
  edgeTtsVoice: string;
  textModel: string;
  imageModel: string;

  // Actions
  addCharacter: (characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>) => Character;
  updateCharacter: (id: string, updates: Partial<Character>) => Character | null;
  deleteCharacter: (id: string) => void;
  setCurrentView: (view: View) => void;
  setEditingCharacterId: (id: string | null) => void;
  importCharacters: (newCharacters: Character | Character[]) => void;
  getCharacterVersion: (characterId: string, version: number) => CharacterVersion | null;
  getCharacterVersions: (characterId: string) => CharacterVersion[];
  restoreCharacterVersion: (characterId: string, version: number) => Character | null;
  setTtsProvider: (provider: 'google' | 'edge') => void;
  setGoogleTtsVoice: (voice: string) => void;
  setEdgeTtsVoice: (voice: string) => void;
  setTextModel: (model: string) => void;
  setImageModel: (model: string) => void;
}

// Create the store with separate state and actions
export const useCharacterStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      characters: [],
      currentView: View.Dashboard,
      editingCharacterId: null,
      genres: ['High Fantasy', 'Cyberpunk', 'Post-Apocalyptic', 'Slice of Life', 'Mythic', 'Historical Fiction'],
      ttsProvider: 'google', // Default TTS provider
      googleTtsVoice: 'gemini-2.5-flash-preview-tts', // Default Google TTS voice
      edgeTtsVoice: 'en-US-GuyNeural', // Default Edge TTS voice
      textModel: 'gemini-2.5-flash', // Default text model
      imageModel: 'gemini-2.0-flash-preview-image-generation', // Default image model

      // Actions
      addCharacter: (characterData) => {
        const now = new Date().toISOString();
        const newCharacter: Character = {
          ...characterData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          currentVersion: 1,
          versions: []
        };

        set((state) => ({
          characters: [...state.characters, newCharacter].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        }));

        return newCharacter;
      },

      updateCharacter: (characterId: string, updates: Partial<Character>) => {
        const now = new Date().toISOString();
        let updatedChar: Character | null = null;

        set((state) => {
          const updatedCharacters = state.characters.map((char) => {
            if (char.id !== characterId) return char;

            const changes = getChanges(char, updates);

            // Create a new version with the current state before updates
            const { id, createdAt, currentVersion, versions, ...charData } = char;
            const newVersion: CharacterVersion = {
              ...charData,
              vocalDescription: char.vocalDescription || null, // Include vocalDescription
              version: char.currentVersion,
              updatedAt: now,
              changes
            };

            // Create the updated character
            updatedChar = {
              ...char,
              ...updates,
              updatedAt: now,
              currentVersion: char.currentVersion + 1,
              versions: [
                ...(char.versions || []).slice(-(MAX_VERSIONS - 1)),
                newVersion
              ]
            };

            return updatedChar;
          });

          return { characters: updatedCharacters };
        });

        return updatedChar;
      },

      deleteCharacter: (id: string) => {
        set((state) => ({
          characters: state.characters.filter((char) => char.id !== id)
        }));
      },

      setCurrentView: (view: View) => {
        set({ currentView: view });
      },

      setEditingCharacterId: (id: string | null) => {
        set({ editingCharacterId: id });
      },

      importCharacters: (newCharacters: Character | Character[]) => {
        const charactersArray = Array.isArray(newCharacters) ? newCharacters : [newCharacters];
        set((state) => ({
          characters: [
            ...state.characters,
            ...charactersArray.filter(
              (newChar) => !state.characters.some((char) => char.id === newChar.id)
            ),
          ],
        }));
      },

      getCharacterVersion: (characterId: string, version: number) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return null;

        if (version === character.currentVersion) {
          // For the current version, create a CharacterVersion from the character
          const { id, createdAt, currentVersion, versions, ...currentState } = character;
          const versionData: CharacterVersion = {
            ...currentState,
            vocalDescription: character.vocalDescription || null, // Include vocalDescription
            version: currentVersion,
            updatedAt: character.updatedAt,
            changes: ['Current version']
          };
          return versionData;
        }

        // For previous versions, find the matching version
        return character.versions?.find(v => v.version === version) || null;
      },

      getCharacterVersions: (characterId: string) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return [];

        const currentVersion: CharacterVersion = (() => {
          const { id, currentVersion, versions, ...currentState } = character;
          return {
            ...currentState,
            vocalDescription: character.vocalDescription || null, // Include vocalDescription
            version: currentVersion,
            updatedAt: character.updatedAt,
            changes: ['Current version']
          };
        })();

        return [...(character.versions || []), currentVersion].sort((a, b) => b.version - a.version);
      },

      restoreCharacterVersion: (characterId: string, version: number) => {
        const character = get().characters.find(c => c.id === characterId);
        if (!character) return null;

        let versionToRestore: CharacterVersion | null = null;

        if (version === character.currentVersion) {
          // Already at this version
          return character;
        }

        versionToRestore = character.versions?.find(v => v.version === version) || null;
        if (!versionToRestore) return null;

        // Create a new version with the restored state
        const now = new Date().toISOString();
        const restoredCharacter: Character = {
          ...character,
          ...versionToRestore,
          updatedAt: now,
          currentVersion: character.currentVersion + 1,
          versions: [
            ...(character.versions || []).slice(-(MAX_VERSIONS - 1)),
            {
              ...versionToRestore,
              vocalDescription: versionToRestore.vocalDescription || null, // Include vocalDescription
              version: character.currentVersion + 1,
              updatedAt: now,
              changes: [`Restored from version ${version}`]
            }
          ]
        };

        // Update the store
        set((state) => ({
          characters: state.characters.map(c =>
            c.id === characterId ? restoredCharacter : c
          )
        }));

        return restoredCharacter;
      },

      setTtsProvider: (provider: 'google' | 'edge') => set({ ttsProvider: provider }),
      setGoogleTtsVoice: (voice: string) => set({ googleTtsVoice: voice }),
      setEdgeTtsVoice: (voice: string) => set({ edgeTtsVoice: voice }),
      setTextModel: (model: string) => set({ textModel: model }),
      setImageModel: (model: string) => set({ imageModel: model }),
    }),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        characters: state.characters,
        genres: state.genres,
        currentView: state.currentView,
        editingCharacterId: state.editingCharacterId,
        ttsProvider: state.ttsProvider,
        googleTtsVoice: state.googleTtsVoice,
        edgeTtsVoice: state.edgeTtsVoice,
        textModel: state.textModel,
        imageModel: state.imageModel,
      })
    }
  )
);

// Create a hook that provides actions separately from state
export const useCharacterActions = () => useCharacterStore(
  (state) => ({
    addCharacter: state.addCharacter,
    updateCharacter: state.updateCharacter,
    deleteCharacter: state.deleteCharacter,
    setCurrentView: state.setCurrentView,
    setEditingCharacterId: state.setEditingCharacterId,
    importCharacters: state.importCharacters,
    getCharacterVersion: state.getCharacterVersion,
    getCharacterVersions: state.getCharacterVersions,
    restoreCharacterVersion: state.restoreCharacterVersion,
    setTtsProvider: state.setTtsProvider,
    setGoogleTtsVoice: state.setGoogleTtsVoice,
    setEdgeTtsVoice: state.setEdgeTtsVoice,
    setTextModel: state.setTextModel,
    setImageModel: state.setImageModel,
  })
);
````

## File: package.json
````json
{
  "name": "the-character-foundry",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "concurrently \"vite\" \"python proxy.py\"",
    "test": "vitest",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@google/genai": "^1.10.0",
    "@google/generative-ai": "^0.24.1",
    "@tanstack/react-query": "^5.90.20",
    "@tanstack/react-query-devtools": "^5.91.3",
    "date-fns": "^4.1.0",
    "edge-tts": "^1.0.1",
    "edge-tts-node": "^1.5.7",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hot-toast": "^2.5.2",
    "zod": "^4.3.6",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^22.16.5",
    "@types/uuid": "^10.0.0",
    "@vitest/coverage-v8": "^3.2.4",
    "autoprefixer": "^10.4.17",
    "concurrently": "^9.2.0",
    "dotenv": "^17.2.1",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "~5.7.2",
    "vite": "^6.2.0",
    "vitest": "^3.2.4"
  }
}
````

## File: services/geminiService.ts
````typescript
import { PartialCharacter } from '../types';
import { validateCharacterResponse, validateImageResponse, validateTTSResponse } from '../schemas/validation';


// Type for TTS configuration

// Types for TTS configuration
type TTSProvider = 'google' | 'edge';

export interface TTSConfig {
  provider: TTSProvider;
  google?: {
    voice?: string;
    languageCode?: string;
    speakingRate?: number;
    pitch?: number;
  };
  edge?: {
    voice?: string;  // Can be any Voice.Name, Voice.ShortName, or Voice.FriendlyName
    rate?: string;   // e.g. '+50%' for 50% faster, '-50%' for 50% slower
    pitch?: string;  // e.g. '+50Hz' for higher pitch, '-50Hz' for lower pitch
    volume?: string; // e.g. '+50%' for 50% louder, '-50%' for 50% quieter
  };
}

// Removed unused interfaces VoiceConfig and AudioConfig



// Model configurations
// These are now dynamically loaded from the store
// const TEXT_MODEL = 'gemini-2.5-flash';
// const IMAGE_MODEL = 'gemini-2.0-flash-preview-image-generation';

// Proxy server configuration
const PROXY_BASE_URL = 'http://localhost:49152';

// Helper function to make secure API calls through proxy
const callGeminiAPI = async (endpoint: string, data: any, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${PROXY_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        
        // Retry on 429 (Too Many Requests) or 5xx errors
        if ((response.status === 429 || response.status >= 500) && i < retries - 1) {
          console.warn(`Retrying API call to ${endpoint} due to ${response.status} error. Attempt ${i + 1}/${retries}.`);
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
          continue;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Retrying API call to ${endpoint} due to network error. Attempt ${i + 1}/${retries}.`);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to call Gemini API after multiple retries.');
};

interface CharacterResponse {
  data: PartialCharacter | null;
  error: string | null;
}

export const fleshOutCharacter = async (
  partialChar: PartialCharacter
): Promise<CharacterResponse> => {
  try {
    const { textModel } = useCharacterStore.getState();
    const prompt = `Given the following partial character data, generate a complete character profile. Fill in any missing details to make the character rich and engaging. Return the character data as a JSON object. Do not include any markdown code block formatting.\n\nPartial Character Data: ${JSON.stringify(partialChar)}`;
    
    const result = await callGeminiAPI('/api/gemini/generate', {
      model: textModel,
      prompt: prompt
    });
    
    if (!result.candidates || result.candidates.length === 0) {
      return { data: null, error: 'No response from Gemini' };
    }
    
    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return { data: null, error: 'No content in Gemini response' };
    }
    
    let text = candidate.content.parts[0].text;
    
    // Attempt to extract JSON from markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      text = jsonMatch[1];
    }
    
    // Attempt to parse the response as JSON
    try {
      const fullCharacterData = JSON.parse(text) as PartialCharacter;
      
      // Validate the parsed data
      const validation = validateCharacterResponse({
        data: { 
          ...fullCharacterData,
          updatedAt: new Date().toISOString(),
          currentVersion: 1,
          versions: []
        }, 
        error: null 
      });
      
      if (!validation.success) {
        console.error('Validation error:', validation.error);
        return { data: null, error: 'Invalid character data structure' };
      }
      
      return validation.data;
    } catch (parseError) {
      console.error('Error parsing character data:', parseError);
      console.error('Response text:', text);
      return { data: null, error: 'Failed to parse character data' };
    }
  } catch (error) {
    console.error('Error generating character details with Gemini:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to generate character details' };
  }
};

interface TTSResponse {
  data: string | null;
  error: string | null;
  provider: TTSProvider;
}

/**
 * Default TTS configuration
 */
const defaultTTSConfig: TTSConfig = {
  provider: 'google',
  google: {
    voice: 'gemini-2.5-flash-preview-tts',
    languageCode: 'en-US',
    speakingRate: 1.0,
    pitch: 0.0
  },
  edge: {
    voice: 'en-US-GuyNeural',
    rate: '+0%', // Use default rate (no change)
    pitch: '+0Hz', // Default pitch (no change)
    volume: '+0%', // Default volume (no change)
  }
};

/**
 * Convert text to speech using the specified provider
 */
import { useCharacterStore } from '../store';

export const textToSpeech = async (
  text: string,
  config: Partial<TTSConfig> = {}
): Promise<TTSResponse> => {
  if (!text) {
    return { 
      data: null, 
      error: 'No text provided',
      provider: config.provider || defaultTTSConfig.provider
    };
  }

  // Get current TTS settings from the store
  const { ttsProvider, googleTtsVoice, edgeTtsVoice } = useCharacterStore.getState();

  // Merge provided config with defaults and store settings
  const ttsConfig: TTSConfig = {
    provider: ttsProvider,
    google: { 
      ...defaultTTSConfig.google, 
      voice: googleTtsVoice, 
      ...(config.google || {}) 
    },
    edge: { 
      ...defaultTTSConfig.edge, 
      voice: edgeTtsVoice, 
      ...(config.edge || {}) 
    }
  };

  try {
    if (ttsConfig.provider === 'google') {
      return textToSpeechGoogle(text, ttsConfig);
    } else if (ttsConfig.provider === 'edge') {
      return textToSpeechEdge(text, ttsConfig);
    } else {
      throw new Error(`Unsupported TTS provider: ${ttsConfig.provider}`);
    }
  } catch (error) {
    console.error(`Error with ${ttsConfig.provider} TTS service:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to generate speech',
      provider: ttsConfig.provider
    };
  }
};

/**
 * Convert text to speech using Google's TTS via secure proxy
 */
async function textToSpeechGoogle(
  text: string,
  config: TTSConfig
): Promise<TTSResponse> {
  if (!text) return { data: null, error: 'No text provided', provider: 'google' };
  
  try {
    const requestBody = {
      text: text,
      voice_name: config.google?.voice || 'Kore',
    };

    const response = await fetch(`${PROXY_BASE_URL}/api/tts/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    const audioBase64 = responseData.audioContent;
    
    if (!audioBase64) {
      const validation = validateTTSResponse({ data: null, error: 'No audio content in response from Google TTS', provider: 'google' });
      return validation.data!;
    }

    const validation = validateTTSResponse({ 
      data: `data:audio/mp3;base64,${audioBase64}`, 
      error: null,
      provider: 'google'
    });
    return validation.success ? validation.data : { data: null, error: 'Invalid TTS response', provider: 'google' };
  } catch (error) {
    console.error('Error in Google TTS service:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Convert text to speech using edge-tts
 */
async function textToSpeechEdge(
  text: string,
  config: TTSConfig
): Promise<TTSResponse> {
  if (!text) return { data: null, error: 'No text provided', provider: 'edge' };
  
  try {
    const requestBody = {
      text: text,
      voice: config.edge?.voice || 'en-US-GuyNeural',
      rate: config.edge?.rate || '+0%',
      pitch: config.edge?.pitch || '+0Hz',
      volume: config.edge?.volume || '+0%',
    };

    const response = await fetch(`${PROXY_BASE_URL}/api/tts/edge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    const audioBase64 = responseData.audioContent;
    
    if (!audioBase64) {
      const validation = validateTTSResponse({ data: null, error: 'No audio content in response from Edge TTS', provider: 'edge' });
      return validation.data!;
    }

    const validation = validateTTSResponse({ 
      data: `data:audio/mp3;base64,${audioBase64}`, 
      error: null,
      provider: 'edge'
    });
    return validation.success ? validation.data : { data: null, error: 'Invalid TTS response', provider: 'edge' };
  } catch (error) {
    console.error('Error in Edge TTS service:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

export const evolveCharacter = async (
  character: PartialCharacter,
  prompt: string
): Promise<CharacterResponse> => {
  try {
    const { textModel } = useCharacterStore.getState();
    const evolutionPrompt = `Given the following character and the user's evolution prompt, generate an updated character profile.\n\nCurrent Character: ${JSON.stringify(character)}\n\nEvolution Prompt: ${prompt}`;
    
    const result = await callGeminiAPI('/api/gemini/generate', {
      model: textModel,
      prompt: evolutionPrompt
    });
    
    if (!result.candidates || result.candidates.length === 0) {
      return { data: null, error: 'No response from Gemini' };
    }
    
    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return { data: null, error: 'No content in Gemini response' };
    }
    
    const text = candidate.content.parts[0].text;
    
    try {
      const updatedData = JSON.parse(text) as PartialCharacter;
      return { data: updatedData, error: null };
    } catch (parseError) {
      console.error('Error parsing evolution data:', parseError);
      return { data: null, error: 'Failed to parse evolution data' };
    }
  } catch (error) {
    console.error('Error evolving character with Gemini:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to evolve character' };
  }
};

interface ImageResponse {
  data: string | null;
  error: string | null;
}

export const generatePortrait = async (
  character: PartialCharacter
): Promise<ImageResponse> => {
  try {
    const { textModel, imageModel } = useCharacterStore.getState();
    // Generate a portrait description for the character
    const descriptionPrompt = `Generate a detailed visual description for a character portrait based on the following traits. Focus on visual details like appearance, clothing, and expression. Be concise but vivid.\n\n${JSON.stringify(character)}`;
    
    // Get a detailed description of the portrait
    const descriptionResult = await callGeminiAPI('/api/gemini/generate', {
      model: textModel,
      prompt: descriptionPrompt
    });
    
    if (!descriptionResult.candidates || descriptionResult.candidates.length === 0) {
      return { data: null, error: 'No description response from Gemini' };
    }
    
    const descriptionCandidate = descriptionResult.candidates[0];
    if (!descriptionCandidate.content || !descriptionCandidate.content.parts || descriptionCandidate.content.parts.length === 0) {
      return { data: null, error: 'No description content in Gemini response' };
    }
    
    const description = descriptionCandidate.content.parts[0].text;
    
    // Generate the image using the description
    const imagePrompt = `${description}\n\nGenerate a portrait image based on this description.`;
    const imageResult = await callGeminiAPI('/api/imagen/generate', {
      prompt: imagePrompt,
      model: imageModel
    });

    // The proxy now returns a URL to the saved image
    if (!imageResult || !imageResult.imageUrl) {
      return validateImageResponse({ data: null, error: 'No image URL in response from proxy' }).data!;
    }

    // Prepend the proxy base URL if the URL is relative
    const imageUrl = imageResult.imageUrl.startsWith('/')
      ? `${PROXY_BASE_URL}${imageResult.imageUrl}`
      : imageResult.imageUrl;

    const validation = validateImageResponse({ data: imageUrl, error: null });
    return validation.success ? validation.data : { data: null, error: 'Invalid image response' };
  } catch (error) {
    console.error('Error generating portrait with Gemini:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to generate portrait' };
  }
};

interface VocalDescriptionResponse {
  data: string | null;
  error: string | null;
}

export const generateVocalDescription = async (
  base64Audio: string
): Promise<VocalDescriptionResponse> => {
  try {
    const { textModel } = useCharacterStore.getState();
    // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
    const audioData = base64Audio.split(',')[1];

    const prompt = "Describe the voice in this audio clip. Focus on characteristics like pitch, tone, pace, and any unique qualities.";

    const result = await callGeminiAPI('/api/gemini/generate', {
      model: textModel,
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'audio/wav', data: audioData } }
          ]
        }
      ]
    });

    if (!result.candidates || result.candidates.length === 0) {
      return { data: null, error: 'No response from Gemini' };
    }

    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return { data: null, error: 'No content in Gemini response' };
    }

    const description = candidate.content.parts[0].text;
    return { data: description, error: null };
  } catch (error) {
    console.error('Error generating vocal description with Gemini:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Failed to generate vocal description' };
  }
};
````

## File: App.tsx
````typescript
import { useState } from 'react';
import { View } from './types';
import Dashboard from './components/Dashboard';
import CharacterForm from './components/CharacterForm';
import { SparklesIcon, SettingsIcon } from './components/Icons';
import { useCharacterStore, useCharacterActions } from './store';
import GenerationOptionsModal from './components/GenerationOptionsModal';
import { Toaster } from 'react-hot-toast';
import ThemeToggle from './components/ThemeToggle';

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
      <Toaster position="top-center" reverseOrder={false} />
      <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
        <h1 className="text-3xl font-bold text-indigo-400">The Character Foundry</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button 
            onClick={() => setShowOptionsModal(true)}
            className="p-2 rounded-full hover:bg-gray-700 transition"
            title="Generation Options"
          >
            <SettingsIcon className="w-6 h-6 text-gray-300" />
          </button>
        </div>
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
    </div>
  );
}

export default App;
````

## File: components/CharacterForm.tsx
````typescript
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Character, CharacterVersion, Genre, PartialCharacter } from '../types';
import Button from './Button';
import { ArrowLeftIcon, SparklesIcon, TrashIcon } from './Icons';
import { useFleshOutCharacter, useGeneratePortrait, useGenerateVocalDescription, useEvolveCharacter } from '../hooks/useAI';
import { useCharacterStore } from '../store';
import ImportExportMenu from './ImportExportMenu';
import PortraitManager from './PortraitManager';
import VoiceManager from './VoiceManager';
import CharacterFields from './CharacterFields';

interface CharacterFormProps {
  initialCharacter: Character | null;
  onBack: () => void;
}

export const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
    <input id={id} {...props} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
  </div>
);

import PlayButton from './PlayButton'; // No-op change to trigger rebuild

export const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  onPlay?: () => void;
  isPlaying?: boolean;
}> = ({ label, id, onPlay, isPlaying, ...props }) => (
  <div className="relative">
    <label htmlFor={id} className="block text-sm font-medium text-indigo-300 mb-1">{label}</label>
    <textarea id={id} {...props} rows={5} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
    {onPlay && (
      <PlayButton onClick={onPlay} isPlaying={!!isPlaying} />
    )}
  </div>
);

const CharacterForm: React.FC<CharacterFormProps> = ({ initialCharacter, onBack }) => {
  // Destructure props with defaults to avoid undefined errors
  const safeInitialCharacter = initialCharacter || {};
  const [character, setCharacter] = useState<Partial<Character>>({});
  const [prompt, setPrompt] = useState('');
  const [showAudioModal, setShowAudioModal] = useState(false);
  const fleshOutMutation = useFleshOutCharacter();
  const generatePortraitMutation = useGeneratePortrait();
  const generateVocalDescriptionMutation = useGenerateVocalDescription();
  const evolveCharacterMutation = useEvolveCharacter();

  useEffect(() => {
    // Initialize character state when initialCharacter changes
    setCharacter(safeInitialCharacter);
  }, [safeInitialCharacter]);

  useEffect(() => {
    return () => {
      // Cleanup code if needed
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreChange = (genre: Genre) => {
    setCharacter(prev => ({ ...prev, genre }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setCharacter(prev => ({ ...prev, portraitBase64: base64String }));
        };
        reader.readAsDataURL(file);
      } else {
        // For audio, open the modal to allow clipping
        setShowAudioModal(true);
        // Store the file temporarily to pass to the iframe
        // This is a simplified approach; a more robust solution might use context or a global store
        (window as any).currentAudioFile = file; 
      }
    }
  };

  useEffect(() => {
    const handleAudioClipped = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setCharacter(prev => ({ ...prev, voiceSampleBase64: customEvent.detail }));
      setShowAudioModal(false);
    };

    window.addEventListener('audioClipped', handleAudioClipped);

    return () => {
      window.removeEventListener('audioClipped', handleAudioClipped);
    };
  }, []);

  const handleFleshOut = useCallback(async () => {
    fleshOutMutation.mutate(character as PartialCharacter, {
      onSuccess: (result) => {
        if (result.data) {
          setCharacter(prev => ({...prev, ...result.data}));
        }
      }
    });
  }, [character, fleshOutMutation]);

  const handleGeneratePortrait = useCallback(async () => {
    if (!character) return;
    
    generatePortraitMutation.mutate(character as PartialCharacter, {
      onSuccess: (result) => {
        if (result.data) {
          setCharacter(prev => ({ ...prev, portraitBase64: result.data }));
        }
      }
    });
  }, [character, generatePortraitMutation]);

  const handleGenerateVocalDescription = useCallback(async () => {
    if (!character.voiceSampleBase64) {
      toast.error("Please upload a voice sample first.");
      return;
    }
    generateVocalDescriptionMutation.mutate(character.voiceSampleBase64, {
      onSuccess: (result) => {
        if (result.data) {
          setCharacter(prev => ({ ...prev, vocalDescription: result.data }));
        }
      }
    });
  }, [character.voiceSampleBase64, generateVocalDescriptionMutation]);

  const handleEvolveCharacter = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    evolveCharacterMutation.mutate(
      { character: character as Character, prompt },
      {
        onSuccess: (result) => {
          if (result.data) {
            setCharacter(prev => ({
              ...prev,
              ...result.data,
              name: result.data?.name || prev.name, // Ensure name is never undefined
            }));
            setPrompt('');
          }
        }
      }
    );
  };

  const createCharacterVersion = useCallback((char: Partial<Character>): CharacterVersion => ({
    name: char.name || '',
    title: char.title || '',
    synopsis: char.synopsis || '',
    personality: char.personality || '',
    flaws: char.flaws || '',
    strengths: char.strengths || '',
    appearance: char.appearance || '',
    backstory: char.backstory || '',
    portraitBase64: char.portraitBase64 || null,
    voiceSampleBase64: char.voiceSampleBase64 || null,
    vocalDescription: char.vocalDescription || null, // Correctly include vocalDescription
    version: char.currentVersion || 1,
    updatedAt: char.updatedAt || new Date().toISOString(),
    changes: ['Initial version']
  }), []);

  const handleSave = useCallback(async () => {
    if (!character.name?.trim()) {
      toast.error('Character name is required');
      return;
    }

    try {
      const now = new Date().toISOString();
      const newVersion = createCharacterVersion(character);
      const versions = character.versions || [];
      
      const characterToSave: Character = {
        id: character.id || Date.now().toString(),
        name: character.name || '',
        title: character.title || '',
        synopsis: character.synopsis || '',
        personality: character.personality || '',
        flaws: character.flaws || '',
        strengths: character.strengths || '',
        appearance: character.appearance || '',
        backstory: character.backstory || '',
        portraitBase64: character.portraitBase64 || null,
        voiceSampleBase64: character.voiceSampleBase64 || null,
        vocalDescription: character.vocalDescription || null,
        genre: character.genre,
        createdAt: character.createdAt || now,
        updatedAt: now,
        currentVersion: newVersion.version,
        versions: [...versions, newVersion]
      };
      
      if (initialCharacter?.id) {
        updateCharacter(initialCharacter.id, characterToSave);
      } else {
        addCharacter(characterToSave);
      }
      
      toast.success(initialCharacter ? 'Character updated!' : 'Character created!');
      onBack();
    } catch (error) {
      console.error('Error saving character:', error);
      toast.error('Failed to save character');
    }
  }, [character, initialCharacter, addCharacter, updateCharacter, onBack, createCharacterVersion]);

  const handleDelete = useCallback(() => {
    if (!initialCharacter?.id) return; // Use initialCharacter directly and check for id
    
    if (window.confirm('Are you sure you want to delete this character? This cannot be undone.')) {
      deleteCharacter(initialCharacter.id);
      onBack();
    }
  }, [initialCharacter, deleteCharacter, onBack]);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-800 text-white">
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center text-indigo-300 hover:text-indigo-100 transition"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Back to Library
        </button>
        <h1 className="text-2xl font-bold">{initialCharacter ? 'Edit Character' : 'Create New Character'}</h1>
        <div className="flex space-x-4">
          <ImportExportMenu character={character} />
          {initialCharacter && (
            <button 
              onClick={handleDelete}
              className="text-red-400 hover:text-red-200 transition"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <PortraitManager
            portraitBase64={character.portraitBase64 || undefined}
            isPortraitLoading={generatePortraitMutation.isPending}
            handleFileChange={handleFileChange}
            handleGeneratePortrait={handleGeneratePortrait}
          />

          <VoiceManager
            voiceSampleBase64={character.voiceSampleBase64 || undefined}
            isAiLoading={generateVocalDescriptionMutation.isPending}
            handleFileChange={handleFileChange}
            handleGenerateVocalDescription={handleGenerateVocalDescription}
          />
        </div>

        <div className="md:col-span-2">
          <CharacterFields
            character={character}
            handleChange={handleChange}
            handleFileChange={handleFileChange as any}
            handleGenreChange={handleGenreChange}
            genres={genres}
          />
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-bold text-indigo-300 mb-4">Evolve with AI</h3>
        <div className="space-y-4">
          <TextareaField
            label="Describe changes or additions..."
            id="prompt"
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Give the character a mysterious scar over their left eye', 'Make the backstory more tragic', 'They found a powerful artifact, describe it'"
          />
          <div className="flex justify-end gap-4">
            <Button onClick={handleEvolveCharacter} variant="secondary" disabled={evolveCharacterMutation.isPending || !prompt}>
              <SparklesIcon className={`mr-2 h-5 w-5 ${evolveCharacterMutation.isPending ? 'animate-spin' : ''}`} />
              {evolveCharacterMutation.isPending ? 'Evolving...' : 'Evolve Character'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end gap-4">
        <Button onClick={handleFleshOut} variant="secondary" disabled={fleshOutMutation.isPending}>
          <SparklesIcon className={`mr-2 h-5 w-5 ${fleshOutMutation.isPending ? 'animate-spin' : ''}`} />
          {fleshOutMutation.isPending ? 'Generating...' : 'Flesh out with AI'}
        </Button>
        <Button onClick={handleSave}>
          Save Character
        </Button>
      </div>

      {showAudioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg w-11/12 max-w-3xl h-3/4">
            <iframe 
              src="/audio_modal.html" 
              className="w-full h-full border-none"
              onLoad={(e) => {
                // Pass the file to the iframe once it's loaded
                const iframe = e.target as HTMLIFrameElement;
                const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
                if (iframe.contentWindow && fileInput && fileInput.files && fileInput.files[0]) {
                  iframe.contentWindow.postMessage({ type: 'audioFile', file: fileInput.files[0] }, '*');
                }
              }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterForm;
````
