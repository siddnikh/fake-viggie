from flask import Blueprint, request, jsonify
from services.chat_service import ChatService

chat_bp = Blueprint('chat', __name__)
chat_service = ChatService()

@chat_bp.route('/', methods=['POST'])
def chat():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        response = chat_service.process_message(data['message'])
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 