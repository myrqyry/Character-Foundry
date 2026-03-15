# State Ownership and Data Flow

This document defines ownership boundaries for state/data flow to reduce architectural drift and debugging ambiguity.

## Why this exists
Audit findings identified drift between UI state, service orchestration, and backend runtime paths. This file establishes explicit ownership to support Phase 2 normalization.

## Ownership map

### 1) Domain state owner: `store/**`
- **Owns**:
  - Character entities and selected character identity.
  - Version history metadata and persistence behavior.
- **Must not own**:
  - API transport concerns.
  - Request retry policies.
  - Backend-specific payload transformations.

### 2) Form/UI transient state owner: `components/**` + `react-hook-form`
- **Owns**:
  - Local form interaction state (dirty, touched, validation errors).
  - UI-only toggles/modals and interaction affordances.
- **Must not own**:
  - Canonical persisted character data rules (delegate to store/schema).

### 3) Service orchestration owner: `services/geminiService.ts`
- **Owns**:
  - Frontend-to-API endpoint calls.
  - Error normalization for AI requests.
  - Request payload shaping that is frontend-contract specific.
- **Must not own**:
  - React component state.
  - Durable local storage state.

### 4) Query/request lifecycle owner: `hooks/**` using TanStack Query
- **Owns**:
  - Request timing, retries, cache invalidation, loading/error state exposure to components.
- **Must not own**:
  - Persisted domain mutations that should live in the store.

### 5) Shared contract owner: `types.ts` + `schemas/**`
- **Owns**:
  - Canonical frontend data shapes and runtime validation boundaries.
- **Must not own**:
  - Transport-specific defaults hidden from callers.

### 6) Backend transport owner: `api/**` and `proxy.py`
- **Owns**:
  - HTTP request validation at route boundaries.
  - Translation to provider APIs (Gemini/Imagen/TTS).
- **Must not own**:
  - Frontend UI semantics.
  - Persistent local domain behavior.

## Current dual-backend policy (temporary)
- `api/**` is the target deployment contract.
- `proxy.py` remains a local development adapter for now.
- Endpoint names and payload contracts should remain aligned across both until one path is retired.

## Decision log: repair / isolate / replace
- `store/**`: **repair in place** (high value, already central).
- `services/geminiService.ts`: **repair in place** with contract tests.
- `proxy.py`: **temporarily isolate** as local-only compatibility layer.
- Any backend path that cannot keep contract parity: **replace later** after vertical slice stabilization.

## Data flow (target)
1. User edits form in component-local state.
2. On save, validated payload is committed to store as canonical local state.
3. On AI action, hook triggers service call.
4. Service calls `/api/*` endpoint and normalizes response/errors.
5. Component consumes normalized result and commits only relevant durable data to store.

## Anti-patterns to avoid
- Direct API response objects written to persisted store without schema checks.
- Components calling fetch directly when service abstraction exists.
- Introducing new endpoint shapes in one backend path only.
