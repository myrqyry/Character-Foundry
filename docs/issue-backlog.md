# Issue Backlog

Severity scale: **Critical**, **High**, **Medium**, **Low**.

## Critical

### CF-001 — Serverless Python handlers fail to parse
- **Severity**: Critical
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
  - Add a CI Python syntax check (`python -m py_compile api/**/*.py` or equivalent script).
- **Confidence**: High

### CF-002 — Lockfile drift breaks reproducible install
- **Severity**: Critical
- **Affected files**:
  - `package.json`
  - `package-lock.json`
- **Why it matters**: `npm ci` (standard CI install) fails, blocking clean builds in CI/CD and on new machines.
- **Reproduction**:
  1. Run `npm ci`.
  2. Observe `npm ci can only install packages when your package.json and package-lock.json are in sync` and `Missing: uuid@11.1.0 from lock file`.
- **Proposed fix**:
  - Regenerate lockfile from current manifest (`npm install` in a clean state), commit lockfile, verify with `npm ci`.
- **Confidence**: High

## High

### CF-003 — Build/test scripts are non-runnable in clean environment
- **Severity**: High
- **Affected files**:
  - `package.json`
  - `package-lock.json`
- **Why it matters**: Core quality gates fail (`build`, `test`), preventing confidence in shipping.
- **Reproduction**:
  1. `npm run build` -> `vite: not found`.
  2. `npm run test -- --run` -> `vitest: not found`.
- **Proposed fix**:
  - Fix lockfile drift first (CF-002), then validate scripts in CI.
- **Confidence**: High

### CF-004 — Dual backend systems create architectural drift
- **Severity**: High
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
- **Proposed fix**:
  - Pick one backend runtime model (recommended: serverless functions for Vercel or a dedicated API service).
  - Remove or quarantine the other.
  - Update docs/scripts accordingly.
- **Confidence**: High

### CF-005 — README operational instructions are inaccurate
- **Severity**: High
- **Affected files**:
  - `README.md`
  - `package.json`
- **Why it matters**: New contributors cannot follow setup reliably; likely to misconfigure env and runtime.
- **Reproduction**:
  1. README instructs `pnpm start` with concurrently; package scripts do not define that behavior.
  2. README references env vars/features not aligned with current code paths.
- **Proposed fix**:
  - Rewrite README around verified commands only.
  - Add “single source of truth” table: local dev, tests, build, deploy, env vars.
- **Confidence**: High

## Medium

### CF-006 — Changelog includes accidental artifact tail
- **Severity**: Medium
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
- **Affected files**:
  - `components/CharacterFields.tsx`
  - `components/CharacterForm.tsx`
- **Why it matters**: `any` and synthetic event coercions mask errors in core editing flows.
- **Reproduction**:
  1. Review `character: any`, `field: any`, and `as any` casts.
- **Proposed fix**:
  - Introduce explicit form field types and properly typed callbacks.
  - Remove forced casts and normalize tag field handling.
- **Confidence**: High

### CF-008 — Stale OpenWeatherMap proxy path is likely dead code
- **Severity**: Medium
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
- **Affected files**:
  - `store/store.test.ts`
  - `services/geminiService.ts`
  - `api/**`
- **Why it matters**: Network parsing and backend contract failures go undetected.
- **Reproduction**:
  1. Inspect tests; only store unit tests exist.
- **Proposed fix**:
  - Add API contract tests/mocks for `services/geminiService.ts`.
  - Add backend handler smoke tests and response schema assertions.
- **Confidence**: High

## Low

### CF-010 — Stale/unclear repo artifacts add noise
- **Severity**: Low
- **Affected files**:
  - `vercel.json.backup2`
  - `metadata.json`
  - `tailwind.config.js`
- **Why it matters**: Increases ambiguity about active config and intended deployment path.
- **Reproduction**:
  1. Observe backup config, unclear metadata file role, and `./src/**/*` Tailwind path with no `src/` directory.
- **Proposed fix**:
  - Remove or document artifact files.
  - Align Tailwind content globs with actual structure.
- **Confidence**: High
