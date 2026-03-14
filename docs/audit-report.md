# Repository Audit Report: Character Foundry

## Scope and method
This audit covered repository structure, manifests/configs, runtime entry points, API surfaces, docs, and representative feature areas.

### Commands executed
- `rg --files`
- `cat package.json`, `cat tsconfig.json`, `cat vite.config.ts`, `cat vercel.json`
- `nl -ba` on key source/docs files
- `npm run build`
- `npm ci`
- `npm run test -- --run`
- `python -m compileall api proxy.py`

## High-level architecture snapshot
- **Frontend**: React + Vite + TypeScript app rooted at `index.tsx`/`App.tsx`.
- **State/data**: Zustand persisted store with version history logic.
- **Server paths**: Two overlapping backend approaches exist:
  1. `proxy.py` Flask proxy server.
  2. `api/**` Python serverless handlers for Vercel-style deployment.
- **AI services**: Frontend calls `/api/*` endpoints via `services/geminiService.ts`.

## Evidence-based findings

### 1) Build/test/install pipeline is currently broken
- `npm run build` fails before build starts: `vite: not found` (deps unavailable).
- `npm ci` fails because lockfile is out of sync with `package.json` (`Missing: uuid@11.1.0 from lock file`).
- `npm run test -- --run` fails similarly (`vitest: not found`).

**Why this matters**
- CI and reproducible local setup are broken; contributors cannot reliably validate or ship changes.

---

### 2) Python serverless API files contain syntactically invalid trailing artifacts
`api/gemini/generate.py`, `api/imagen/generate.py`, `api/tts/google.py`, and `api/tts/edge.py` include trailing non-Python text (`</content>` and `<parameter ...>`), causing syntax errors.

- Confirmed by `python -m compileall api proxy.py` with SyntaxError in all four files.

**Why this matters**
- All serverless Python endpoints fail to import/execute.
- Production API paths used by the frontend are non-functional unless replaced by `proxy.py` routes.

---

### 3) Backend strategy drift: Flask proxy and serverless handlers diverge
- `services/geminiService.ts` targets `/api/gemini/generate`, `/api/imagen/generate`, `/api/tts/google`, `/api/tts/edge`.
- `proxy.py` defines matching Flask routes, but also includes stale OpenWeatherMap proxy code and legacy `/api/gemini/generate-image`.
- `api/**` directory duplicates similar behavior in a second backend model, but is currently broken.

**Why this matters**
- Two backend systems increase maintenance burden and confuse deployment/runtime assumptions.
- Docs do not clearly define one canonical local/prod backend path.

---

### 4) README and changelog drift from actual runnable setup
Key mismatches:
- README says `pnpm start` runs frontend + backend concurrently, but `package.json` has `"start": "vite preview"` only.
- README claims specific stack versions (e.g., React `19.2.4`, Vite `6.4.1`) that do not match manifest ranges (`react ^19.1.0`, `vite ^6.2.0`).
- README includes `OPENWEATHERMAP_API_KEY` in env setup though feature appears legacy and unrelated to current product behavior.
- `CHANGELOG.md` also contains trailing artifact text similar to broken Python files.

**Why this matters**
- Onboarding friction and false expectations.
- Increased chance of misconfigured environments and failed first run.

---

### 5) Type safety and quality drift in form layer
- `components/CharacterFields.tsx` uses `any` for field and character props and casts synthetic events (`as any`).
- `components/CharacterForm.tsx` also uses `any` in validation error mapping and forced handler casts.

**Why this matters**
- Weak typing where user input is handled increases regressions and runtime bugs.
- Makes future refactoring harder.

---

### 6) Stale/dead artifacts and duplicate configs
- `vercel.json.backup2` appears obsolete and conflicts with current install/build strategy.
- `metadata.json` appears deployment/tool artifact with unclear runtime use.
- `audio_modal.html` is a standalone clipping UI loaded in an iframe and relies on unpkg scripts; no lockstep versioning or integration tests.
- `tailwind.config.js` scans `./src/**/*` despite no `src/` tree (non-breaking, but stale signal).

**Why this matters**
- Noise obscures the active system and increases maintenance uncertainty.

---

### 7) Testing coverage is narrow relative to risk areas
- Only `store/store.test.ts` exists.
- No tests for:
  - API adapters (`services/geminiService.ts`)
  - critical user flows (form save/evolve/generate)
  - backend handlers
  - docs/install sanity checks

**Why this matters**
- Most fragile paths (network + parsing + model I/O + deployment) are untested.

## Valuable parts worth retaining
- Core domain model (`types.ts`) and validation schemas (`schemas/validation.ts`) are a strong base.
- Store and versioning logic (`store/index.ts`, `store/versioning.ts`) is conceptually useful.
- Feature surface in UI components is broad and coherent enough to preserve UX concepts.
- AI service abstraction layer centralizes endpoint interactions in one file.

## Preliminary recommendation
This repository should be **rebuilt from extracted pieces** (option 3), not archived.

Rationale:
- There is clear product value and reusable logic.
- But execution/deployment integrity is compromised (broken Python handlers, dependency/lock drift, backend duplication, doc drift), making in-place recovery riskier than a clean, deliberate re-foundation.
