# The Character Foundry

Character Foundry is a React + TypeScript app for creating and versioning fictional character profiles, with optional AI-assisted generation (Gemini text/image/TTS) through Python API proxies.

## Documentation
- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Contributor Guide](docs/contributor-guide.md)
- [Technical Overview (RAG & TTS)](docs/technical-overview.md)
- [Salvage Plan](docs/salvage-plan.md)

## Current status
This repository has been salvaged and stabilized. It is now a robust platform for AI character creation.

## Key Features
- **Local character CRUD** with automatic versioning.
- **AI-powered generation** using Gemini 3 series.
- **Lore Memory (RAG)**: Characters remember their past evolutions via ChromaDB.
- **Advanced TTS**: Cloud synthesis (Google/Edge) and local voice cloning (Qwen3-TTS).

## Project structure
- `index.tsx`, `App.tsx`: frontend entry + shell
- `components/`: UI and feature components
- `store/`: Zustand store and versioning logic
- `services/geminiService.ts`: frontend API client for AI endpoints
- `proxy.py`: Flask API proxy for local development
- `api/**`: serverless Python handlers for Vercel API routes
- `docs/`: audit, verdict, issue backlog, and salvage plan

## Prerequisites
- Node.js 18+
- Python 3.8+
- **pnpm** (preferred; repo includes pnpm lockfile)
- **uv** for Python dependency management

## Setup (recommended)
Run these from the repo root:

```bash
pnpm install
uv sync
```

## Environment variables
Create `.env.local` (frontend usage) or `.env` (python usage) with:

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_TTS_API_KEY=your_google_or_gemini_key_optional
VITE_API_BASE_URL=http://localhost:49152
```

`GOOGLE_TTS_API_KEY` falls back to `GEMINI_API_KEY` in Python routes.

`VITE_API_BASE_URL` is optional. Leave it unset for same-origin `/api/*` calls, or set it when running frontend and Flask proxy on different ports during local development.

## Scripts
- `npm run dev` – run Vite frontend
- `npm run dev:api` – run Flask proxy on `http://localhost:49152`
- `npm run dev:full` – run frontend + Flask proxy concurrently
- `npm run build` – production frontend build
- `npm run preview` – preview built frontend
- `npm run test` – Vitest
- `npm run typecheck` – TypeScript checks
- `npm run check` – typecheck + tests
- `npm run check:py` – Python API/proxy syntax check
- `npm run check:foundation` – Python syntax check + frontend build

## API routes expected by frontend
- `POST /api/gemini/generate` (Text)
- `POST /api/imagen/generate` (Portraits)
- `POST /api/tts/google` (Native TTS)
- `POST /api/tts/qwen` (Voice Cloning)
- `POST /api/memory/index` (RAG Indexing)
- `POST /api/memory/search` (RAG Retrieval)

These can be served by `proxy.py` locally, or via `api/**` serverless handlers in deployment.

## Notes
- This repo currently focuses on stabilization and cleanup; no scope expansion is planned during salvage.
