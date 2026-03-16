# System Architecture: Character Foundry

This document describes the high-level architecture of the Character Foundry using the C4 model and sequence diagrams.

## Container Diagram

The system consists of a React frontend and two possible backend runtimes (Local Proxy and Serverless Functions) that orchestrate calls to external AI services and local vector storage.

```mermaid
graph TD
    User((User))
    
    subgraph "Character Foundry System"
        Frontend[React Web App]
        Backend["Backend (api/ or proxy.py)"]
        ChromaDB[(ChromaDB Lore Memory)]
    end
    
    subgraph "External AI Services"
        Gemini[Google Gemini API]
        Imagen[Google Imagen API]
        EdgeTTS[Edge TTS Service]
    end
    
    User -->|Uses| Frontend
    Frontend -->|API Requests| Backend
    Backend -->|Indexes/Searches| ChromaDB
    Backend -->|Text/Image/Audio Generation| Gemini
    Backend -->|Image Generation| Imagen
    Backend -->|Speech Synthesis| EdgeTTS
    Backend -->|Local Voice Cloning| Qwen[Local Qwen3-TTS]
```

## Data Flow: Character Evolution with Memory

This diagram traces how a character evolves while maintaining consistency via RAG.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as ChromaDB
    participant AI as Gemini 3

    U->>F: Enter Evolution Prompt
    F->>B: POST /api/memory/search (Query)
    B->>DB: Query Lore for Context
    DB-->>B: Return Relevant Snippets
    B-->>F: Return Context
    F->>B: POST /api/gemini/generate (Prompt + Context)
    B->>AI: Generate Updated Profile
    AI-->>B: Return New Character JSON
    B-->>F: Return New Profile
    F->>U: Display Evolved Character
    U->>F: Click Save
    F->>B: POST /api/memory/index (Character)
    B->>DB: Upsert Embeddings
```

## Core Components

### 1. Frontend (React 19)
- **State**: Managed via `zustand` (Character store) with persistence.
- **Async Operations**: Orchestrated by `TanStack Query` hooks in `hooks/useAI.ts`.
- **Validation**: Schema-first validation using `zod`.

### 2. Backend (Serverless api/)
- **Runtime**: Python 3.12 managed by `uv`.
- **Handlers**: Single-purpose serverless handlers in `api/gemini/`, `api/tts/`, etc.
- **Local Dev**: `proxy.py` mirrors the serverless environment for standard Flask development.

### 3. AI Orchestration
- **Lore Memory**: ChromaDB provides a local vector store in `./.memory/`.
- **Text-to-Speech**: Multi-provider support (Google, Edge, and local Qwen3-TTS voice cloning).
- **Image Generation**: High-fidelity character portraits via Gemini 3.1 Flash Image.

## Key Design Principles
1. **Source of Truth**: The `api/` directory is the canonical production path.
2. **Deterministic Evolution**: Past character traits are indexed as vector embeddings to prevent AI "hallucination drift" during long sessions.
3. **Type Strictness**: No `any` types in core service logic; all API contracts are validated by Zod schemas.
