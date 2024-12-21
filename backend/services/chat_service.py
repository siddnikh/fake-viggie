from openai import OpenAI
import json
import os

class ChatService:
    def __init__(self):
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    def process_message(self, message: str):
        # Call OpenAI API
        completion = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """
                You are a helpful assistant for a driving school registration form. 
                Help users fill out their information and answer questions about the registration process.
                When you identify user information, return it in a structured format for form filling.
                """},
                {"role": "user", "content": message}
            ],
            functions=[{
                "name": "fill_form_fields",
                "description": "Fill form fields with user information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "firstName": {"type": "string"},
                        "lastName": {"type": "string"},
                        "email": {"type": "string"},
                        "phone": {"type": "string"},
                        "dateOfBirth": {"type": "string"},
                        "address": {"type": "string"},
                        "hasLicense": {"type": "boolean"},
                        "licenseNumber": {"type": "string"},
                        "preferredTransmission": {"type": "string"}
                    }
                }
            }]
        )

        response = completion.choices[0].message

        # Check if there's a function call
        if response.function_call:
            fields = json.loads(response.function_call.arguments)
            return {
                "text": response.content,
                "action": {
                    "type": "fillForm",
                    "fields": fields
                }
            }
        
        return {
            "text": response.content
        } 