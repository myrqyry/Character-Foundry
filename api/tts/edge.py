import asyncio
import base64
import json
import os
import tempfile
from edge_tts import Communicate


async def generate_speech_async(text, voice, rate, pitch, volume):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmpfile:
        filepath = tmpfile.name

    communicate = Communicate(text, voice, rate=rate, pitch=pitch, volume=volume)
    await communicate.save(filepath)

    with open(filepath, 'rb') as audio_file:
        audio_content = base64.b64encode(audio_file.read()).decode('utf-8')

    os.remove(filepath)
    return audio_content


def handler(event, context):
    try:
        data = json.loads(event.get('body') or '{}')
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
                'body': json.dumps({'error': 'Text is required'})
            }

        audio_content = asyncio.run(generate_speech_async(text, voice, rate, pitch, volume))

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'audioContent': audio_content, 'mimeType': 'audio/mp3'})
        }
    except Exception as error:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Edge TTS proxy error: {str(error)}'})
        }
