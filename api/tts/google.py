import json
import os
import requests


def handler(event, context):
    api_key = os.getenv('GOOGLE_TTS_API_KEY') or os.getenv('GEMINI_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Google TTS API key not configured'})
        }

    try:
        data = json.loads(event.get('body') or '{}')
        text = data.get('text')
        if not text:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Text is required'})
            }

        model = 'gemini-2.5-flash-tts'
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            'contents': [{'parts': [{'text': text}]}],
            'generationConfig': {'responseMimeType': 'audio/mpeg'}
        }

        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
        response.raise_for_status()
        result = response.json()

        candidates = result.get('candidates', [])
        if candidates:
            parts = candidates[0].get('content', {}).get('parts', [])
            if parts and 'inlineData' in parts[0]:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'audioContent': parts[0]['inlineData'].get('data'),
                        'mimeType': parts[0]['inlineData'].get('mimeType', 'audio/mpeg')
                    })
                }

        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'No audio content in response'})
        }
    except requests.exceptions.RequestException as error:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Google TTS API error: {str(error)}'})
        }
    except Exception as error:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Server error: {str(error)}'})
        }
