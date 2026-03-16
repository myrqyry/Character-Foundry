# Contributor Guide: Zero to Hero

Welcome to the Character Foundry! This guide will help you set up your development environment and start contributing effectively.

## 1. Prerequisites

Ensure you have the following tools installed:
- **Node.js**: v18+ (Required for React)
- **pnpm**: v9+ (Package management)
- **Python**: v3.12+ (Backend services)
- **uv**: v0.1+ (Python environment management)
- **Git**: For version control

## 2. Environment Setup

### Clone the Repository
```bash
git clone https://github.com/myrqyry/Character-Foundry.git
cd Character-Foundry
```

### Install Dependencies
```bash
pnpm install
uv sync
```

### Configuration
Copy the example environment file and add your API keys:
```bash
cp .env.example .env
```
*Note: You need a `GEMINI_API_KEY` from Google AI Studio to use most features.*

## 3. Development Workflow

### Starting the Full Stack
This project uses `concurrently` to run both the React frontend and the Python proxy simultaneously.
```bash
pnpm run dev:full
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:49152](http://localhost:49152)

### Coding Standards
- **TypeScript**: No `any`. Use the models defined in `types.ts`.
- **Imports**: Use the `@/` alias for absolute paths (e.g., `@/components/Button`).
- **Python**: All new handlers must live in `api/` and follow the `handler(event, context)` signature.

## 4. Running Tests

### Frontend Tests (Vitest)
```bash
pnpm run test        # Watch mode
pnpm run test:watch  # Alias for above
pnpm run test -- --run # Single run
```

### Python Syntax Check
```bash
pnpm run check:py
```

## 5. Adding a New AI Feature
If you want to add a new AI capability (e.g., character world-building):
1. Create a new handler in `api/world/generate.py`.
2. Add a corresponding route in `proxy.py` for local testing.
3. Define a Zod schema in `schemas/validation.ts`.
4. Create a service method in `services/worldService.ts` to call the API.
5. Use the `hooks/useAI.ts` pattern to expose the functionality to React components.

## 6. Where to Get Help
- Check the `docs/architecture.md` for a system overview.
- Refer to `AGENTS.md` for detailed technical mandates.
- For AI API details, see [Google Gemini Docs](https://ai.google.dev/docs).

Happy coding!
