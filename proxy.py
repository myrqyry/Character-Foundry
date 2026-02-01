import os
import requests
import base64
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import edge_tts
import asyncio
import tempfile

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Load API keys from environment variables
OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_TTS_API_KEY = os.getenv("GOOGLE_TTS_API_KEY") or GEMINI_API_KEY  # Use Gemini key as fallback

# Define API endpoints
OPENWEATHERMAP_API_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather"
GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"
GOOGLE_TTS_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize"

@app.route('/proxy/<api_name>', methods=['GET'])
def proxy(api_name):
    if api_name == 'openweathermap':
        api_key = OPENWEATHERMAP_API_KEY
        api_url = OPENWEATHERMAP_API_ENDPOINT
    else:
        return jsonify({"error": "Unknown API"}), 404

    # Add the API key to the query parameters for OpenWeatherMap
    params = request.args.to_dict()
    params['appid'] = api_key

    headers = {
        'Content-Type': 'application/json'
    }

    # Forward the request to the third-party API
    try:
        resp = requests.get(api_url, headers=headers, params=params)
        resp.raise_for_status()  # Raise an exception for bad status codes
        return jsonify(resp.json()), resp.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/gemini/generate', methods=['POST'])
def gemini_generate():
    """Proxy for Gemini text generation"""
    if not GEMINI_API_KEY:
        return jsonify({"error": "Gemini API key not configured"}), 500
    
    try:
        data = request.get_json()
        model = data.get('model', 'gemini-2.0-flash-exp')
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        url = f"{GEMINI_API_ENDPOINT}/{model}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/gemini/generate-image', methods=['POST'])
def gemini_generate_image():
    """Proxy for Gemini image generation"""
    if not GEMINI_API_KEY:
        return jsonify({"error": "Gemini API key not configured"}), 500
    
    try:
        data = request.get_json()
        model = data.get('model', 'gemini-pro-vision')
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        url = f"{GEMINI_API_ENDPOINT}/{model}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/imagen/generate', methods=['POST'])
def generate_image_imagen():
    """Proxy for Imagen 3 Image Generation"""
    data = request.json
    print(f"Incoming request data to /api/imagen/generate: {data}")
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'error': 'GEMINI_API_KEY not set'}), 500

    model = 'gemini-2.0-flash-preview-image-generation' # Correct model for this task
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}'
    headers = {'Content-Type': 'application/json'}
    payload = {
        'contents': [
            {
                'parts': [
                    {'text': prompt}
                ]
            }
        ],
        'generationConfig': {
            'responseMimeType': 'image/png'
        }
    }
    print(f"Sending request to Gemini API. URL: {url}, Payload: {payload}")

    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Received response from Gemini API. Status: {response.status_code}, Content: {response.text}")
        response.raise_for_status()
        image_data = response.json()

        if 'candidates' in image_data and len(image_data['candidates']) > 0:
            # The image is expected in the first part of the response
            part = image_data['candidates'][0]['content']['parts'][0]
            if 'inlineData' in part and part['inlineData']['mimeType'].startswith('image/'):
                base64_image = part['inlineData']['data']
                image_bytes = base64.b64decode(base64_image)
                
                image_dir = 'public/portraits'
                if not os.path.exists(image_dir):
                    os.makedirs(image_dir)
                
                image_filename = f'{uuid.uuid4()}.png'
                image_path = os.path.join(image_dir, image_filename)
                
                with open(image_path, 'wb') as f:
                    f.write(image_bytes)
                
                return jsonify({'imageUrl': f'/portraits/{image_filename}'})

        return jsonify({'error': 'No image data received from API'}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Gemini API request error: {e}'}), 500


@app.route('/api/tts/google', methods=['POST'])
def google_tts():
    """Proxy for Gemini 2.5 Text-to-Speech"""
    if not GOOGLE_TTS_API_KEY:
        return jsonify({"error": "Google TTS API key not configured"}), 500

    try:
        data = request.get_json()
        text = data.get('text')
        voice_name = data.get('voice_name', 'Kore')  # Default to a known voice

        if not text:
            return jsonify({"error": "Text is required"}), 400

        model = "gemini-2.5-flash-preview-tts"
        url = f"{GEMINI_API_ENDPOINT}/{model}:generateContent?key={GOOGLE_TTS_API_KEY}"

        payload = {
            "contents": {"parts": [{"text": text}]},
            "generationConfig": {
                "responseMimeType": "audio/mpeg"
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"
                }
            ]
        }

        headers = {
            'Content-Type': 'application/json'
        }

        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()

        result = response.json()
        
        # Extract base64 audio content from the new response structure
        if 'candidates' in result and len(result['candidates']) > 0:
            content = result['candidates'][0].get('content', {})
            parts = content.get('parts', [])
            if len(parts) > 0 and 'audio' in parts[0]:
                audio_content = parts[0]['audio']['data']
                return jsonify({
                    'audioContent': audio_content,
                    'mimeType': 'audio/mp3'
                })

        return jsonify({"error": "No audio content in response"}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Google TTS API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/tts/edge', methods=['POST'])
def edge_tts_proxy():
    """Proxy for Edge TTS"""
    try:
        data = request.get_json()
        text = data.get('text')
        voice = data.get('voice', 'en-US-GuyNeural')
        rate = data.get('rate', '+0%')
        pitch = data.get('pitch', '+0Hz')
        volume = data.get('volume', '+0%')

        if not text:
            return jsonify({"error": "Text is required"}), 400

        async def generate_speech():
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmpfile:
                filepath = tmpfile.name

            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, volume=volume)
            await communicate.save(filepath)
            return filepath

        # Run the async function in the current thread
        filepath = asyncio.run(generate_speech())

        with open(filepath, 'rb') as f:
            audio_content = base64.b64encode(f.read()).decode('utf-8')
        
        os.remove(filepath)  # Clean up the temporary file

        return jsonify({
            'audioContent': audio_content,
            'mimeType': 'audio/mp3'
        })

    except Exception as e:
        return jsonify({"error": f"Edge TTS proxy error: {str(e)}"}), 500

if __name__ == '__main__':
    # Using a port in the ephemeral range
    app.run(debug=True, port=49152)
