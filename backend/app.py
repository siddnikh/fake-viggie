from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import traceback
from datetime import datetime
from werkzeug.exceptions import HTTPException

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URL
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True  # Add this if you're using cookies/credentials
    }
})

# Set the working directory to the backend folder
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Register blueprints
from routes.chat_routes import chat_bp
from routes.student_routes import student_bp

app.register_blueprint(student_bp, url_prefix='/student')
app.register_blueprint(chat_bp, url_prefix='/chat')

@app.before_request
def log_request():
    # Log the incoming request
    logger.info(f'Request: {request.method} {request.url} - Headers: {dict(request.headers)} - Body: {request.get_data()}')

@app.after_request
def log_response(response):
    # Log the response
    logger.info(f'Response: {response.status} - {response.get_data()}')
    return response

@app.errorhandler(Exception)
def handle_error(error):
    # Log any unhandled exceptions
    error_message = f'Error: {str(error)}\n{traceback.format_exc()}'
    logger.error(error_message)
    return jsonify({'error': str(error)}), 500

@app.errorhandler(HTTPException)
def handle_http_error(error):
    # Log HTTP errors (including CORS)
    error_message = f'HTTP Error {error.code}: {error.description} - URL: {request.url} - Origin: {request.headers.get("Origin")}'
    logger.error(error_message)
    return jsonify({
        'error': error.description,
        'code': error.code
    }), error.code

@app.after_request
def cors_logging(response):
    # Specifically log CORS-related headers
    if response.headers.get('Access-Control-Allow-Origin'):
        logger.info(
            f'CORS Request - Origin: {request.headers.get("Origin")} - '
            f'Method: {request.method} - '
            f'Headers: {response.headers.get("Access-Control-Allow-Headers")} - '
            f'Allowed: {response.headers.get("Access-Control-Allow-Origin")}'
        )
    return response

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'message': 'pong'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)
