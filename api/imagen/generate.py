import json
import os
import requests


def handler(event, context):
    data = json.loads(event.get("body") or "{}")
    prompt = data.get("prompt")
    model = data.get("model", "gemini-3.1-flash-image-preview")

    if not prompt:
        return {
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": "Prompt is required"}),
        }

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
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "image/png"},
        }

        response = requests.post(
            url, json=payload, headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()

        candidates = result.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts and "inlineData" in parts[0]:
                inline_data = parts[0]["inlineData"]
                if inline_data.get("mimeType", "").startswith("image/"):
                    return {
                        "statusCode": 200,
                        "headers": {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                        "body": json.dumps(
                            {
                                "imageData": inline_data.get("data"),
                                "mimeType": inline_data.get("mimeType", "image/png"),
                            }
                        ),
                    }

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": "No image data received from API"}),
        }
    except requests.exceptions.RequestException as error:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": f"Gemini API request error: {str(error)}"}),
        }
