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
        character_id = data.get("character_id")
        query = data.get("query")
        n_results = data.get("n_results", 5)

        if not query:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps({"error": "Query is required"}),
            }

        # Initialize GenAI client for embeddings
        client_genai = genai.Client(api_key=api_key)

        # Get query embedding
        embedding_response = client_genai.models.embed_content(
            model="text-embedding-004", contents=query
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

        # Prepare search filters
        where = {"character_id": character_id} if character_id else None

        # Search
        results = collection.query(
            query_embeddings=[list(embedding_values)], n_results=n_results, where=where
        )

        # Format results
        formatted_results = []
        documents = results.get("documents")
        metadatas = results.get("metadatas")
        distances = results.get("distances")

        if documents and metadatas:
            for i in range(len(documents[0])):
                formatted_results.append(
                    {
                        "content": documents[0][i],
                        "metadata": metadatas[0][i],
                        "distance": float(distances[0][i]) if distances else None,
                    }
                )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"results": formatted_results}),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": str(e)}),
        }
