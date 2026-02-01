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