import os
import requests
import json

def handler(event, context):
    if not os.getenv('GOOGLE_TTS_API_KEY'):
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({"error": "Google TTS API key not configured"})
        }

    try:
        data = json.loads(event['body'])
        text = data.get('text')
        voice_name = data.get('voice_name', 'gemini-2.5-flash-tts')

        if not text:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({"error": "Text is required"})
            }

        model = "gemini-2.5-flash-tts"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={os.getenv('GOOGLE_TTS_API_KEY')}"

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

        # Extract base64 audio content from the response structure
        if 'candidates' in result and len(result['candidates']) > 0:
            content = result['candidates'][0].get('content', {})
            parts = content.get('parts', [])
            if len(parts) > 0 and 'audio' in parts[0]:
                audio_content = parts[0]['audio']['data']
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'audioContent': audio_content,
                        'mimeType': 'audio/mp3'
                    })
                }

        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({"error": "No audio content in response"})
        }

    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({"error": f"Google TTS API error: {str(e)}"})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({"error": f"Server error: {str(e)}"})
        }</content>
<parameter name="filePath">/home/myrqyry/MQR/theCharacterFoundry/api/tts/google.py