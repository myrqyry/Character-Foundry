# API Reference

The Character Foundry provides several internal API endpoints for AI orchestration and memory management.

## Base URL
- **Local Dev (proxy.py)**: `http://localhost:49152`
- **Production (Vercel)**: `/` (Relative paths)

---

## Gemini Services

### POST `/api/gemini/generate`
Generates character text or performs reasoning.
- **Request Body**:
  ```json
  {
    "model": "gemini-3-flash-preview",
    "prompt": "String prompt...",
    "contents": [] // Optional multimodal content
  }
  ```
- **Success Response**: Gemini Content JSON.

### POST `/api/imagen/generate`
Generates high-fidelity character portraits.
- **Request Body**:
  ```json
  {
    "model": "gemini-3.1-flash-image-preview",
    "prompt": "Visual description..."
  }
  ```
- **Success Response**:
  ```json
  {
    "imageData": "base64...",
    "mimeType": "image/png"
  }
  ```

---

## Speech Services (TTS)

### POST `/api/tts/google`
Uses Gemini Native TTS.
- **Request Body**:
  ```json
  {
    "text": "Text to speak",
    "voice_name": "Kore" // Optional, defaults to Kore
  }
  ```
- **Success Response**: Base64 audio content (MP3).

### POST `/api/tts/qwen` (Local Only)
Performs zero-shot voice cloning using local Qwen3-TTS.
- **Request Body**:
  ```json
  {
    "text": "Text to generate",
    "ref_audio": "data:audio/wav;base64,...",
    "ref_text": "Transcript of the reference audio",
    "language": "English"
  }
  ```
- **Success Response**: Base64 audio content (WAV).

---

## Lore Memory (RAG)

### POST `/api/memory/index`
Indexes a character's current state into the vector store.
- **Request Body**:
  ```json
  {
    "character": { "id": "...", "name": "...", "personality": "..." }
  }
  ```
- **Logic**: Generates `text-embedding-004` embeddings and upserts to ChromaDB.

### POST `/api/memory/search`
Retrieves character lore snippets based on semantic similarity.
- **Request Body**:
  ```json
  {
    "query": "Who is the mentor?",
    "character_id": "optional-uuid",
    "n_results": 5
  }
  ```
- **Success Response**:
  ```json
  {
    "results": [
      { "content": "Lore snippet...", "distance": 0.123 }
    ]
  }
  ```

---

## Error Handling
All endpoints return a standard error JSON on failure:
```json
{
  "error": "Descriptive error message"
}
```
Common Status Codes:
- `400`: Missing required fields.
- `429`: API quota exceeded (Forwarded from Gemini).
- `500`: Server configuration error (Missing API keys).
