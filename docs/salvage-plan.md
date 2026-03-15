# Salvage Plan

This plan executes against the audited findings in:
- `docs/audit-report.md`
- `docs/issue-backlog.md`
- `docs/repo-verdict.md`

Principles for every phase:
- Preserve behavior unless a defect forces change.
- Prefer small, reviewable commits over broad rewrites.
- Link each meaningful change to a backlog issue.
- Keep docs truthful to what is currently runnable.

## Phase 1: Foundation cleanup

**Goal:** make install, startup, and baseline checks predictable.

### Scope
- Normalize scripts and local commands.
- Keep package/build/tooling config coherent.
- Remove legacy/broken workflow fragments.
- Resolve obvious dependency/API mismatches and syntax breakage.
- Ensure clean install and reproducible local startup path.

### Work in this pass
1. Added a Python syntax gate command in npm scripts (`check:py`) to catch serverless/proxy parse regressions early.  
   - Addresses: **CF-001**.
2. Added a focused foundation check (`check:foundation`) to chain Python compile check with frontend build.  
   - Addresses: **CF-003**.
3. Removed accidental artifact tail from `CHANGELOG.md` and corrected misleading script wording (`pnpm start` → `npm run dev:full`).  
   - Addresses: **CF-006**, **CF-005**.
4. Added foundation cleanup execution summary (`docs/foundation-cleanup-summary.md`) so outcomes and blockers are explicit.  
   - Addresses: **CF-005** (documentation drift).
5. Began incremental form typing cleanup by removing `any` usage in key editor components and adding explicit typed tag-change callbacks.  
   - Addresses: **CF-007** (partial).
6. Normalized frontend API base URL handling with `VITE_API_BASE_URL` (fallback same-origin) to reduce local/prod request-path ambiguity.
   - Addresses: **CF-004**, **CF-005**.

### Exit criteria
- Commands for build/typecheck/test/python syntax are present and documented.
- No known syntax-corrupted API files remain.
- Setup/docs no longer reference clearly wrong command names.

## Phase 2: Architecture normalization

**Goal:** reduce drift and clarify operational boundaries.

### Scope
- Identify the core system boundaries and ownership.
- Reduce duplicate/conflicting patterns.
- Remove dead placeholders where safe.
- Clarify ownership of state, services, modules, and shared types.

### Work in this pass
1. Authored `docs/state-ownership.md` to formalize ownership between:
   - persistent local domain state (`store/**`),
   - request/orchestration layer (`hooks/**`, `services/**`),
   - transport/runtime backends (`proxy.py` and `api/**`).
2. Documented backend strategy status as **temporary dual-runtime**, with a deliberate migration target (serverless-first, proxy retained only for local development until parity checks complete).
   - Addresses: **CF-004**.
3. Added state ownership boundaries in `docs/state-ownership.md` to define which layer owns persistence, request orchestration, and transport contracts.
   - Addresses: **CF-004**.

### Exit criteria
- Every major subsystem has a documented owner and boundary.
- “Repair in place vs isolate vs replace later” is explicit for fragile subsystems.

## Phase 3: Vertical slice stabilization

**Goal:** make one critical flow reliable end-to-end before broad polish.

### Candidate slice (next batch)
- **Character create/edit/save + one AI text generation call**.

### Planned work
- Trace UI action → store update → service call → API response handling.
- Fix race/state assumptions in that single path only.
- Add minimal tests for the path contract.

### Exit criteria
- Slice is reproducible locally with a documented command path.
- Known failure states are surfaced with user-facing errors.

## Phase 4: Hardening

**Goal:** leave a trustworthy baseline for contributors.

### Scope
- Improve error handling at API boundaries.
- Add/repair focused tests.
- Update docs to match reality only.
- Remove stale comments/roadmap drift.

### Exit criteria
- Focused automated checks cover highest-risk contracts.
- Docs + scripts agree with observed runtime behavior.
- Backlog reflects what is done vs deferred.

## Subsystem strategy decisions (current)
- `api/**` serverless handlers: **repair in place** (already parseable; keep stabilizing contracts).
- `proxy.py`: **temporarily isolate** as local-dev adapter; keep parity with serverless endpoints only.
- Legacy/stale artifacts and doc drift: **replace/remove later** in controlled cleanups once vertical slice is stable.

## Next batch recommendation
1. Unblock deterministic dependency install in this environment and close **CF-002/CF-003** with fresh evidence (`npm ci`, `npm run build`, `npm run test -- --run`).
2. Implement and test the vertical slice contract for `/api/gemini/generate` from `services/geminiService.ts` through one backend path.
3. Start reducing typed `any` usage in form components (**CF-007**) without changing UX behavior.
