import os
import requests
import json

def handler(event, context):
    if not os.getenv('GEMINI_API_KEY'):
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({"error": "Gemini API key not configured"})
        }

    try:
        data = json.loads(event['body'])
        model = data.get('model', 'gemini-3-flash-preview')
        prompt = data.get('prompt')

        if not prompt:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({"error": "Prompt is required"})
            }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={os.getenv('GEMINI_API_KEY')}"

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

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': response.text
        }

    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({"error": f"Gemini API error: {str(e)}"})
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
<parameter name="filePath">/home/myrqyry/MQR/theCharacterFoundry/api/gemini/generate.py