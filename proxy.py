import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Load API keys from environment variables
OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
# Add other API keys here
# API_KEY_2 = os.getenv("API_KEY_2")

# Define API endpoints
OPENWEATHERMAP_API_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather"
# Add other API endpoints here
# API_ENDPOINT_2 = "https://api.anotherprovider.com/v2/info"

@app.route('/proxy/<api_name>', methods=['GET'])
def proxy(api_name):
    if api_name == 'openweathermap':
        api_key = OPENWEATHERMAP_API_KEY
        api_url = OPENWEATHERMAP_API_ENDPOINT
    # Add other APIs here
    # elif api_name == 'api2':
    #     api_key = API_KEY_2
    #     api_url = API_ENDPOINT_2
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

if __name__ == '__main__':
    # Using a port in the ephemeral range
    app.run(debug=True, port=49152)
