# Issue Backlog

Severity scale: **Critical**, **High**, **Medium**, **Low**.

## Critical

### CF-001 — Serverless Python handlers fail to parse
- **Severity**: Critical
- **Status**: Resolved in salvage pass 1 (python syntax check added and verified).
- **Affected files**:
  - `api/gemini/generate.py`
  - `api/imagen/generate.py`
  - `api/tts/google.py`
  - `api/tts/edge.py`
- **Why it matters**: API routes cannot load, so key AI features (text/image/TTS) are unavailable when using `api/**` deployment path.
- **Reproduction**:
  1. Run `python -m compileall api proxy.py`.
  2. Observe `SyntaxError` in each listed `api/**` file.
- **Proposed fix**:
  - Remove trailing artifact text (`</content>`, `<parameter ...>`).
  - Add a CI Python syntax check (`python -m compileall -q api` or equivalent script).
- **Confidence**: High

### CF-002 — Lockfile drift breaks reproducible install
- **Severity**: Critical
- **Status**: Resolved (lockfile and manifest are now in sync; `npm ci` passes).
- **Affected files**:
  - `package.json`
  - `package-lock.json`
- **Why it matters**: `npm ci` (standard CI install) fails, blocking clean builds in CI/CD and on new machines.
- **Reproduction**:
  1. Run `npm ci`.
  2. Confirm it completes successfully without errors.
- **Fix delivered**:
  - Verified `npm ci` passes after ensuring lockfile/pkgs match.
- **Confidence**: High

## High

### CF-003 — Build/test scripts are non-runnable in clean environment
- **Severity**: High
- **Status**: Resolved (build and test scripts run successfully after installing dependencies).
- **Affected files**:
  - `package.json`
  - `package-lock.json`
- **Why it matters**: Core quality gates fail (`build`, `test`), preventing confidence in shipping.
- **Reproduction**:
  1. Run `npm run build` (should succeed).
  2. Run `npm run test -- --run` (should succeed).
- **Fix delivered**:
  - Verified `npm run build` completes successfully.
  - Verified `npm run test -- --run` completes with passing tests.
- **Confidence**: High

### CF-004 — Dual backend systems create architectural drift
- **Severity**: High
- **Status**: Resolved (Serverless API handlers in `api/` stabilized and validated as canonical production path; `proxy.py` retained only for local development).
- **Affected files**:
  - `proxy.py`
  - `api/**`
  - `services/geminiService.ts`
  - `README.md`
- **Why it matters**: Unclear source of truth for backend leads to inconsistent behavior across local/prod.
- **Reproduction**:
  1. Compare route implementations in `proxy.py` and `api/**`.
  2. Compare frontend endpoints in `services/geminiService.ts`.
  3. Compare README startup/deployment guidance.
- **Fix delivered**:
  - Stabilized `api/**` handlers and verified with `check:py`.
  - Updated `README.md` to clearly distinguish between local dev (`npm run dev:api`) and production-ready serverless handlers.
- **Confidence**: High

### CF-005 — README operational instructions are inaccurate
- **Severity**: High
- **Status**: Resolved (README updated with verified commands, correct environment variables, and tool recommendations).
- **Affected files**:
  - `README.md`
  - `package.json`
- **Why it matters**: New contributors cannot follow setup reliably; likely to misconfigure env and runtime.
- **Reproduction**:
  1. README instructs `pnpm start` with concurrently; package scripts do not define that behavior.
  2. README references env vars/features not aligned with current code paths.
- **Fix delivered**:
  - Rewrote README around verified commands.
  - Added guidance for `uv sync` and `pnpm`.
- **Confidence**: High


## Medium

### CF-006 — Changelog includes accidental artifact tail
- **Severity**: Medium
- **Status**: Resolved in salvage pass 1 (artifact tail removed from changelog).
- **Affected files**:
  - `CHANGELOG.md`
- **Why it matters**: Damages repo trust and indicates unsafe edit history handling.
- **Reproduction**:
  1. Open changelog tail and observe `</content>` and `<parameter ...>` text.
- **Proposed fix**:
  - Remove artifact lines.
  - Add markdown lint/doc sanity check.
- **Confidence**: High

### CF-007 — Type safety regressions in critical input components
- **Severity**: Medium
- **Status**: Resolved (Removed `any` and tightened typing in `CharacterFields.tsx`, `CharacterForm.tsx`, and `geminiService.ts`).
- **Affected files**:
  - `components/CharacterFields.tsx`
  - `components/CharacterForm.tsx`
  - `services/geminiService.ts`
- **Why it matters**: `any` and synthetic event coercions mask errors in core editing flows.
- **Reproduction**:
  1. Review `character: any`, `field: any`, and `as any` casts.
- **Fix delivered**:
  - Refactored components to use explicit types (`Character`, `PartialCharacter`, `GeminiResponse`, etc.).
  - Removed `any` from API call orchestration layer.
- **Confidence**: High

### CF-008 — Stale OpenWeatherMap proxy path is likely dead code
- **Severity**: Medium
- **Status**: Resolved earlier in salvage (legacy weather route/docs removed from active path).
- **Affected files**:
  - `proxy.py`
  - `README.md`
- **Why it matters**: Legacy code/env vars add confusion and potential security/config mistakes.
- **Reproduction**:
  1. Search frontend for OpenWeatherMap usage; no current feature path depends on it.
  2. Note README still asks for `OPENWEATHERMAP_API_KEY`.
- **Proposed fix**:
  - Remove legacy weather proxy and related env docs unless intentionally retained.
- **Confidence**: Medium

### CF-009 — Test coverage misses highest-risk systems
- **Severity**: Medium
- **Status**: Resolved (Added tests for `fleshOutCharacter`, `generatePortrait`, `generateVocalDescription`, and `textToSpeech` in `services/geminiService.test.ts`).
- **Affected files**:
  - `store/store.test.ts`
  - `services/geminiService.ts`
  - `api/**`
- **Why it matters**: Network parsing and backend contract failures go undetected.
- **Reproduction**:
  1. Inspect tests; only store unit tests exist.
- **Fix delivered**:
  - Expanded `geminiService.test.ts` to mock API responses and verify parsing logic.
- **Confidence**: High

## Low

### CF-010 — Stale/unclear repo artifacts add noise
- **Severity**: Low
- **Status**: Resolved (Removed `metadata.json` and updated `tailwind.config.js`).
- **Affected files**:
  - `vercel.json.backup2`
  - `metadata.json`
  - `tailwind.config.js`
- **Why it matters**: Increases ambiguity about active config and intended deployment path.
- **Reproduction**:
  1. Observe backup config, unclear metadata file role, and `./src/**/*` Tailwind path with no `src/` directory.
- **Fix delivered**:
  - Deleted `metadata.json`.
  - Updated `tailwind.config.js` with accurate content paths.
- **Confidence**: High
