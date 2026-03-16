import json
import os
from google import genai
import chromadb
from typing import List, Any


def handler(event, context):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": "GEMINI_API_KEY not set"}),
        }

    try:
        data = json.loads(event.get("body") or "{}")
        character = data.get("character")

        if not character or "id" not in character:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": "Valid character data required"}),
            }

        # Initialize GenAI client for embeddings
        client_genai = genai.Client(api_key=api_key)

        # Create lore text
        lore_parts = [
            f"Name: {character.get('name')}",
            f"Title: {character.get('title')}",
            f"Synopsis: {character.get('synopsis')}",
            f"Personality: {character.get('personality')}",
            f"Backstory: {character.get('backstory')}",
        ]
        lore_text = "\n".join(filter(None, lore_parts))

        # Get embedding using the new SDK
        embedding_response = client_genai.models.embed_content(
            model="text-embedding-004", contents=lore_text
        )

        if not embedding_response.embeddings:
            return {
                "statusCode": 500,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": "Failed to generate embedding"}),
            }

        embedding_values = embedding_response.embeddings[0].values
        if embedding_values is None:
            return {
                "statusCode": 500,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": "Embedding values are None"}),
            }

        # Initialize ChromaDB
        client_chroma = chromadb.PersistentClient(path="./.memory")
        collection = client_chroma.get_or_create_collection(name="character_lore")

        # Metadata for filtering
        metadata = {
            "character_id": character["id"],
            "version": character.get("currentVersion", 1),
            "updatedAt": character.get("updatedAt", ""),
        }

        # Index lore
        collection.upsert(
            embeddings=[list(embedding_values)],
            documents=[lore_text],
            metadatas=[metadata],
            ids=[f"{character['id']}_v{metadata['version']}"],
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"message": "Character lore indexed successfully"}),
        }

    except Exception as e:
        import traceback

        print(traceback.format_exc())
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": str(e)}),
        }
