# Foundation Cleanup Summary (Salvage Pass 1)

This document records concrete Phase 1/2 salvage actions completed in this pass and what remains blocked.

## Completed changes

### 1) Foundation check scripts normalized in `package.json`
- Added `check:py` (`python -m compileall -q api proxy.py`) to keep Python endpoint syntax regressions detectable.
- Added `check:foundation` (`npm run check:py && npm run build`) as a single command for backend syntax + frontend build baseline.
- Audit/backlog mapping: **CF-001**, **CF-003**.

### 2) Documentation drift corrected
- `README.md` scripts section updated to include the real verification commands (`check:py`, `check:foundation`).
- `CHANGELOG.md` cleaned to remove accidental non-markdown tail artifact and stale `pnpm start` wording.
- Audit/backlog mapping: **CF-005**, **CF-006**.

### 3) Type-safety friction reduced in form layer (incremental)
- `components/CharacterFields.tsx` now uses explicit field config typing instead of `any`, typed character props (`Partial<Character>`), safer option handling, and explicit `handleTagsChange` callback props.
- `components/CharacterForm.tsx` removed `any` usage in validation issue mapping, removed forced `handleFileChange as any` cast, and now updates tag arrays through a typed callback.
- Audit/backlog mapping: **CF-007** (partial progress).

### 4) Architecture normalization documentation added
- Added explicit state/data ownership boundaries and temporary dual-runtime policy in `docs/state-ownership.md`.
- Audit/backlog mapping: **CF-004**.

### 5) API base URL handling normalized for local/prod parity
- `services/geminiService.ts` now reads `VITE_API_BASE_URL` (fallback `''`) instead of hard-coding an empty proxy prefix.
- `README.md` now documents `VITE_API_BASE_URL` for split-port local development with Flask proxy.
- Audit/backlog mapping: **CF-004**, **CF-005**.

## Validation run in this pass
- `python -m compileall -q api proxy.py` ✅ passed.
- `npm run check:py && npm run build` ❌ failed with `vite: not found` in current environment install state.
- `npm run typecheck` ❌ failed with missing type definition packages in current environment install state.
- `npm ci` ⚠️ did not complete successfully in this environment during this pass, so install reproducibility remains unproven here.

## Remaining risks
- **CF-002** still open: clean `npm ci` evidence is missing.
- **CF-003** still open: build/test/typecheck remain blocked by dependency install state.
- **CF-007** only partially addressed: other form/service typing debt remains.
- **CF-010** open: stale artifact cleanup is still pending.

## Next highest-value pass
1. Resolve install determinism first (`npm ci` in clean environment) and refresh lockfile only if drift is confirmed.
2. Re-run and capture baseline gates: `npm run build`, `npm run test -- --run`, `npm run typecheck`.
3. Add focused adapter/backend contract tests for `/api/gemini/generate` path to start closing **CF-009**.
