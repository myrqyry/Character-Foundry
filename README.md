# The Character Foundry

## Project Description

The Character Foundry is a modern web application designed to help users create and manage detailed fictional characters using AI assistance. It leverages Google's Gemini API to generate rich character profiles, backstories, personality traits, and physical descriptions, streamlining the creative process for writers, game developers, and role-playing enthusiasts.

The application features a React-based frontend with TypeScript, a Flask backend proxy for API management, and comprehensive state management with Zustand and TanStack Query.

## Recent Updates

### February 2026 - Gemini API Model Updates
- **Text Generation**: Updated to `gemini-3-flash-preview` (latest model with improved performance)
- **Image Generation**: Migrated to `gemini-2.5-flash-image` (GA model replacing deprecated versions)
- **Text-to-Speech**: Updated to `gemini-2.5-flash-tts` (optimized low-latency model)
- **SDK Updates**: Updated Google GenAI SDK to v1.39.0 for latest features and bug fixes
- **Deprecation Compliance**: Removed usage of models scheduled for shutdown (e.g., `gemini-2.0-flash-preview-image-generation`)

All changes maintain backward compatibility while providing access to the latest AI capabilities.

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
*   **AI Integration**: Google Gemini API (@google/genai v1.39.0)
*   **Gemini Models**: 
  * Text Generation: `gemini-3-flash-preview`
  * Image Generation: `gemini-2.5-flash-image`
  * Text-to-Speech: `gemini-2.5-flash-tts`
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

## Deployment to Vercel

### Prerequisites
- Vercel account (free tier available)
- Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy to Vercel
```bash
vercel
```

Follow the prompts:
- Link to existing project or create new
- Set project name (e.g., `character-foundry`)
- Configure environment variables (see step 3)

### 3. Configure Environment Variables
In Vercel dashboard or CLI, set these environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_TTS_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit API keys to your repository. Always use environment variables.

### 4. Update Build Settings (if needed)
Vercel should automatically detect the configuration from `vercel.json`. The build settings are:
- **Framework**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 5. Access Your App
After deployment, Vercel will provide a URL like `https://character-foundry.vercel.app`

### API Routes
The app uses Vercel serverless functions for backend APIs:
- `/api/gemini/generate` - Text generation
- `/api/imagen/generate` - Image generation  
- `/api/tts/google` - Google TTS
- `/api/tts/edge` - Edge TTS

### Security Notes
- API keys are stored securely in Vercel environment variables
- Serverless functions run in isolated environments
- CORS is configured to allow your frontend domain
- No API keys are exposed in client-side code

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

### Alternative: Vercel Deployment (Production)

For production deployment with API key protection, see the [Deployment to Vercel](#deployment-to-vercel) section below.

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
