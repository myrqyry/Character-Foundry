# Salvage Plan

This plan builds directly on:
- `docs/audit-report.md`
- `docs/issue-backlog.md`
- `docs/repo-verdict.md`

Guiding constraints:
- Incremental refactors, not rewrites.
- Preserve working behavior where possible.
- Reduce friction and ambiguity before feature work.

## Phase 1 — Foundation cleanup
**Objective:** make setup and baseline checks trustworthy.

### Work items
1. Normalize npm scripts and dev flow around verified commands.
2. Remove dependency friction that blocks clean installs/checks.
3. Repair syntax-broken backend files so they are loadable.
4. Remove clearly misleading config/docs references.

### Acceptance criteria
- `package.json` scripts reflect actual local workflows.
- Python API files compile/import without syntax errors.
- README setup and scripts match repository reality.

### Status
- ✅ Scripts normalized (`dev`, `dev:api`, `dev:full`, `typecheck`, `check`).
- ✅ Removed UUID package dependency from runtime path by using `crypto.randomUUID()` in store.
- ✅ Repaired syntax-corrupted files in `api/**`.
- ✅ README rewritten to current, verified flows.

## Phase 2 — Architecture normalization
**Objective:** reduce duplicated/contradictory backend behavior and clarify one contract.

### Work items
1. Align request contracts for text/image/tts across:
   - frontend client (`services/geminiService.ts`),
   - local backend (`proxy.py`),
   - serverless handlers (`api/**`).
2. Remove legacy routes/feature remnants not used by current product path.
3. Keep endpoint names stable to avoid unnecessary frontend churn.

### Acceptance criteria
- Same payload shape is accepted across local and serverless paths.
- Legacy dead routes are removed or explicitly deprecated.

### Status
- ✅ Normalized `/api/gemini/generate` to accept `prompt` or `contents` in both Flask and serverless paths.
- ✅ Removed obsolete OpenWeather proxy path and stale image endpoint from `proxy.py`.
- ✅ Kept existing frontend endpoint names unchanged.

## Phase 3 — Vertical slice stabilization
**Objective:** one end-to-end slice works reliably with minimal scope.

### Chosen slice
**Character editor local flow:** create/edit/save character with persisted state + versioning.

### Work items
1. Keep store behavior stable and deterministic.
2. Ensure build-time env handling is compatible with Vite runtime.
3. Keep UI behavior unchanged unless required for stability.

### Acceptance criteria
- Local non-AI character lifecycle remains intact.
- No functional regressions in create/edit/save flow.

### Status
- ✅ Query devtools env check updated to Vite-native `import.meta.env.DEV`.
- ✅ Store ID generation path simplified (`crypto.randomUUID`) without behavior change to users.
- 🔄 Full runtime verification blocked by package registry access limits in this environment.

## Phase 4 — Docs/testing/hardening
**Objective:** lock in reliability and reduce future drift.

### Work items
1. Add focused tests for service adapters and API handler contracts.
2. Add CI checks for Python syntax and TypeScript typecheck.
3. Align docs with only verified commands and env vars.
4. Prune or clearly mark stale artifact files.

### Acceptance criteria
- Automated checks cover frontend type safety + backend syntax at minimum.
- Docs are accurate and minimal.

### Initial backlog mapping
- Critical first: CF-001, CF-002, CF-003.
- Next: CF-004, CF-005.
- Then: CF-006 onward.
