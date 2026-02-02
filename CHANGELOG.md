# Changelog

All notable changes to The Character Foundry will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Gemini API Models Updated**:
  - Text generation: `gemini-2.5-flash` → `gemini-3-flash-preview`
  - Image generation: `gemini-2.0-flash-preview-image-generation` → `gemini-2.5-flash-image`
  - Text-to-speech: `gemini-2.5-flash-preview-tts` → `gemini-2.5-flash-tts`
- **Dependencies Updated**:
  - @google/genai: ^1.10.0 → ^1.39.0
- **Deprecation Compliance**: Migrated away from models scheduled for shutdown to ensure long-term compatibility

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