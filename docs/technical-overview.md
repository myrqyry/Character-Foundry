# Technical Overview: Lore Memory & Voice Cloning

This document dives into the implementation details of the Character Foundry's advanced AI features.

## 1. Lore Memory (RAG)

To solve the problem of AI "forgetting" character traits during a multi-turn evolution session, we implemented a Retrieval-Augmented Generation (RAG) layer.

### Embedding Strategy
We use Gemini's `text-embedding-004` model. It was chosen for its 768-dimensional vector output which provides a high level of semantic nuance while remaining cost-effective.
- **Scope**: Every "Save" operation triggers an index update.
- **Normalization**: The character's `Personality`, `Backstory`, and `Synopsis` are concatenated into a single lore document before embedding.

### Vector Storage (ChromaDB)
`chromadb` is used as the persistent local database.
- **Location**: Store in the root `.memory/` directory.
- **Filtering**: We store the `character_id` as metadata, allowing us to perform targeted similarity searches that don't mix up different characters' lore.

## 2. Voice Cloning (Qwen3-TTS)

While we use Google Gemini and Edge TTS for standard speech, we integrated **Qwen3-TTS** for high-fidelity voice cloning.

### Architecture
Qwen3-TTS is run locally (or via a local worker) rather than a cloud API.
- **Mechanism**: Zero-shot voice cloning. It requires a ~10-30 second `ref_audio` sample and a `ref_text` transcript of that sample.
- **Model Choice**: `Qwen/Qwen3-TTS-12Hz-0.6B-Base` was chosen as the default for its balance between memory footprint and cloning accuracy.

### Hardware Acceleration
The `api/tts/qwen.py` handler is hardware-aware:
```python
device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
```
It utilizes FP16/BFloat16 for faster inference on NVIDIA GPUs.

## 3. Model Progression
The project has migrated through the following model tiers:
- **Phase 1 (Legacy)**: Gemini 2.0 / 2.5 Flash.
- **Phase 2 (Current)**: Gemini 3 Flash / 3.1 Pro.
    - `gemini-3-flash-preview`: Primary text generation.
    - `gemini-3.1-flash-image-preview`: Primary portrait generation (Nano Banana 2).
    - `gemini-2.5-flash-preview-tts`: Primary cloud speech.

## 4. State Management & Versioning
Character data is stored in a **Zustand** store with `persist` middleware.
- **Versioning**: Every "AI Evolve" operation creates a `CharacterVersion` entry.
- **Restoration**: Users can "revert" to any past version. This restoration also triggers a re-index of the character lore to ensure the RAG memory matches the current timeline.
