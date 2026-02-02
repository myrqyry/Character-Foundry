import os
import requests
import json
import uuid

def handler(event, context):
    data = json.loads(event['body'])
    prompt = data.get('prompt')

    if not prompt:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Prompt is required'})
        }

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'GEMINI_API_KEY not set'})
        }

    model = 'gemini-2.5-flash-image'
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

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        image_data = response.json()

        if 'candidates' in image_data and len(image_data['candidates']) > 0:
            part = image_data['candidates'][0]['content']['parts'][0]
            if 'inlineData' in part and part['inlineData']['mimeType'].startswith('image/'):
                base64_image = part['inlineData']['data']

                # For Vercel, we'll return the base64 data directly
                # In production, you might want to upload to cloud storage
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'imageData': base64_image,
                        'mimeType': 'image/png'
                    })
                }

        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'No image data received from API'})
        }

    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Gemini API request error: {e}'})
        }</content>
<parameter name="filePath">/home/myrqyry/MQR/theCharacterFoundry/api/imagen/generate.py