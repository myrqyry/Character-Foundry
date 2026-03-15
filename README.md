# The Character Foundry

Character Foundry is a React + TypeScript app for creating and versioning fictional character profiles, with optional AI-assisted generation (Gemini text/image/TTS) through Python API proxies.

## Current status (salvage in progress)
This repository is being stabilized in-place with an incremental salvage plan. Current priority is reliability over new features.

## What currently works reliably
- Local character CRUD in the UI
- Local persistence via Zustand
- Character version history utilities

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
uv venv
uv pip install -r requirements.txt
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
- `POST /api/gemini/generate`
- `POST /api/imagen/generate`
- `POST /api/tts/google`
- `POST /api/tts/edge`

These can be served by `proxy.py` locally, or via `api/**` serverless handlers in deployment.

## Notes
- This repo currently focuses on stabilization and cleanup; no scope expansion is planned during salvage.
