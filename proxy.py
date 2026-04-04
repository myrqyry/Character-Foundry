import asyncio
import base64
import os
import tempfile
import json

import edge_tts
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_TTS_API_KEY = os.getenv("GOOGLE_TTS_API_KEY") or GEMINI_API_KEY
GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"


@app.route("/api/gemini/generate", methods=["POST"])
def gemini_generate():
    if not GEMINI_API_KEY:
        return jsonify({"error": "Gemini API key not configured"}), 500

    try:
        data = request.get_json() or {}
        model = data.get("model", "gemini-3-flash-preview")
        prompt = data.get("prompt")
        contents = data.get("contents")

        if not prompt and not contents:
            return jsonify({"error": "Either prompt or contents is required"}), 400

        payload = {
            "contents": contents if contents else [{"parts": [{"text": prompt}]}]
        }
        response = requests.post(
            f"{GEMINI_API_ENDPOINT}/{model}:generateContent?key={GEMINI_API_KEY}",
            json=payload,
            headers={"Content-Type": "application/json"},
        )
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.exceptions.RequestException as error:
        return jsonify({"error": f"Gemini API error: {str(error)}"}), 500


@app.route("/api/imagen/generate", methods=["POST"])
def imagen_generate():
    data = request.get_json() or {}
    prompt = data.get("prompt")
    model = data.get("model", "gemini-3.1-flash-image-preview")

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    if not GEMINI_API_KEY:
        return jsonify({"error": "GEMINI_API_KEY not set"}), 500

    try:
        response = requests.post(
            f"{GEMINI_API_ENDPOINT}/{model}:generateContent?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "image/png"},
            },
        )
        response.raise_for_status()
        image_data = response.json()

        candidates = image_data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts and "inlineData" in parts[0]:
                inline_data = parts[0]["inlineData"]
                if inline_data.get("mimeType", "").startswith("image/"):
                    return (
                        jsonify(
                            {
                                "imageData": inline_data.get("data"),
                                "mimeType": inline_data.get("mimeType"),
                            }
                        ),
                        200,
                    )

        return jsonify({"error": "No image data received from API"}), 500
    except requests.exceptions.RequestException as error:
        return jsonify({"error": f"Gemini API request error: {str(error)}"}), 500


@app.route("/api/tts/google", methods=["POST"])
def google_tts_generate():
    if not GOOGLE_TTS_API_KEY:
        return jsonify({"error": "Google TTS API key not configured"}), 500

    try:
        data = request.get_json() or {}
        text = data.get("text")
        voice_name = data.get("voice_name", "Kore")

        if not text:
            return jsonify({"error": "Text is required"}), 400

        model = "gemini-2.5-flash-preview-tts"
        payload = {
            "contents": [{"parts": [{"text": text}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice_name}}
                },
            },
        }

        response = requests.post(
            f"{GEMINI_API_ENDPOINT}/{model}:generateContent?key={GOOGLE_TTS_API_KEY}",
            json=payload,
            headers={"Content-Type": "application/json"},
        )
        response.raise_for_status()
        result = response.json()

        candidates = result.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts and "inlineData" in parts[0]:
                inline_data = parts[0]["inlineData"]
                return jsonify(
                    {
                        "audioContent": inline_data.get("data"),
                        "mimeType": inline_data.get("mimeType", "audio/mpeg"),
                    }
                ), 200

        return jsonify({"error": "No audio content in response"}), 500
    except requests.exceptions.RequestException as error:
        return jsonify({"error": f"Google TTS API error: {str(error)}"}), 500


async def _generate_edge_tts(text, voice, rate, pitch, volume):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmpfile:
        filepath = tmpfile.name

    communicate = edge_tts.Communicate(
        text, voice, rate=rate, pitch=pitch, volume=volume
    )
    await communicate.save(filepath)

    with open(filepath, "rb") as audio_file:
        audio_content = base64.b64encode(audio_file.read()).decode("utf-8")

    os.remove(filepath)
    return audio_content


@app.route("/api/tts/edge", methods=["POST"])
def edge_tts_generate():
    try:
        data = request.get_json() or {}
        text = data.get("text")
        voice = data.get("voice", "en-US-GuyNeural")
        rate = data.get("rate", "+0%")
        pitch = data.get("pitch", "+0Hz")
        volume = data.get("volume", "+0%")

        if not text:
            return jsonify({"error": "Text is required"}), 400

        audio_content = asyncio.run(
            _generate_edge_tts(text, voice, rate, pitch, volume)
        )
        return jsonify({"audioContent": audio_content, "mimeType": "audio/mp3"}), 200
    except Exception as error:
        return jsonify({"error": f"Edge TTS proxy error: {str(error)}"}), 500


from api.tts.qwen import handler as qwen_handler
from api.memory.index import handler as memory_index_handler
from api.memory.search import handler as memory_search_handler


@app.route("/api/tts/qwen", methods=["POST"])
def qwen_tts_generate():
    # Wrap the serverless handler for Flask
    event = {
        "body": request.get_data().decode("utf-8"),
        "headers": dict(request.headers),
    }
    result = qwen_handler(event, None)
    return jsonify(json.loads(result["body"])), result["statusCode"]


@app.route("/api/memory/index", methods=["POST"])
def memory_index():
    # Wrap the serverless handler for Flask
    event = {
        "body": request.get_data().decode("utf-8"),
        "headers": dict(request.headers),
    }
    result = memory_index_handler(event, None)
    return jsonify(json.loads(result["body"])), result["statusCode"]


@app.route("/api/memory/search", methods=["POST"])
def memory_search():
    # Wrap the serverless handler for Flask
    event = {
        "body": request.get_data().decode("utf-8"),
        "headers": dict(request.headers),
    }
    result = memory_search_handler(event, None)
    return jsonify(json.loads(result["body"])), result["statusCode"]


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=49152)
