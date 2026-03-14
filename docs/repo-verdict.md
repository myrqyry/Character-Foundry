# Repository Verdict

## Decision
**Recommended path: 3) Rebuild from extracted pieces.**

This repo has meaningful product ideas and reusable code, but core execution reliability is currently too low (broken serverless handlers, lockfile drift, backend duplication, docs drift) for confident in-place continuation.

## What is still valuable
1. **Domain and data model foundation**
   - Character + version types are coherent and map well to product goals.
2. **State/versioning concepts**
   - Zustand store + versioning utilities can be reused with minimal conceptual changes.
3. **UI/UX feature map**
   - Existing components encode useful product scope (editor, dashboard, voice/portrait workflows).
4. **Centralized AI service boundary**
   - `services/geminiService.ts` provides a single integration seam to redesign cleanly.

## What is broken or risky
1. **Serverless Python API files currently fail syntax checks** and cannot run.
2. **Install/build/test chain is not reproducible** due to lockfile drift.
3. **Two competing backend systems** (`proxy.py` and `api/**`) create architectural ambiguity.
4. **Documentation does not match reality** (scripts, env setup, feature wiring), increasing onboarding and ops risk.
5. **Testing is focused on store only**, leaving API and integration paths unguarded.

## Why not archive
The project contains enough reusable logic and product direction to justify rescue effort.

## Why not salvage/refactor in place
In-place recovery would require broad surgery while ambiguity remains about runtime architecture. A structured rebuild with extracted proven pieces is lower risk and easier to validate phase-by-phase.

## Exact pieces to carry over into rebuild
### Keep with minimal edits
- `types.ts`
- `schemas/validation.ts`
- `store/versioning.ts`
- selective logic from `store/index.ts` (state shape + actions, minus persistence assumptions)
- UI component patterns from:
  - `components/Dashboard.tsx`
  - `components/CharacterForm.tsx`
  - `components/PortraitManager.tsx`
  - `components/VoiceManager.tsx`

### Keep conceptually, re-implement carefully
- `services/geminiService.ts` endpoint abstraction and retry/error strategy.
- API route contracts for generate/image/tts (but not current Python file bodies).

### Do **not** carry over as-is
- `api/**` current file contents (must be replaced due to syntax corruption).
- Dual-backend setup (`proxy.py` + serverless) without a single chosen architecture.
- stale docs/config backups (`vercel.json.backup2`, outdated README sections).

## Suggested rebuild phases
### Phase 1 — Foundation and runtime clarity
- Pick one backend strategy (serverless functions preferred for Vercel alignment).
- Create clean scripts and lockfile; enforce `npm ci`, `npm run build`, `npm test` in CI.
- Define env contract (`.env.example`) with only required keys.

### Phase 2 — Core vertical slice
- Implement one end-to-end flow: create/edit character + save/version + one AI text call.
- Port validated model/store code.
- Add tests for schema validation and API adapter behavior.

### Phase 3 — Feature reintroduction and hardening
- Reintroduce portrait and TTS features behind stable contracts.
- Add integration tests and error-state UX checks.
- Rewrite README/changelog/deployment docs from verified commands only.

## Promotion criteria for active development
Promote to active development only after:
1. Reproducible clean install (`npm ci`) and passing build/test in CI.
2. One unambiguous backend runtime path documented and deployed.
3. Critical user flows (create/edit/generate) covered by automated tests.
4. README reflects actual scripts, env vars, and deployment model.
