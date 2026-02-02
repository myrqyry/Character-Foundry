import os
import json
import base64
import tempfile
import asyncio
from edge_tts import Communicate

async def generate_speech_async(text, voice, rate, pitch, volume):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmpfile:
        filepath = tmpfile.name

    communicate = Communicate(text, voice, rate=rate, pitch=pitch, volume=volume)
    await communicate.save(filepath)

    with open(filepath, 'rb') as f:
        audio_content = base64.b64encode(f.read()).decode('utf-8')

    os.remove(filepath)  # Clean up the temporary file
    return audio_content

def handler(event, context):
    try:
        data = json.loads(event['body'])
        text = data.get('text')
        voice = data.get('voice', 'en-US-GuyNeural')
        rate = data.get('rate', '+0%')
        pitch = data.get('pitch', '+0Hz')
        volume = data.get('volume', '+0%')

        if not text:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({"error": "Text is required"})
            }

        # Run the async function
        audio_content = asyncio.run(generate_speech_async(text, voice, rate, pitch, volume))

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

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({"error": f"Edge TTS proxy error: {str(e)}"})
        }</content>
<parameter name="filePath">/home/myrqyry/MQR/theCharacterFoundry/api/tts/edge.py