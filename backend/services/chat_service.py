from openai import OpenAI
import json
import os

class ChatService:
    def __init__(self):
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    def process_message(self, message: str):
        # First call to get the form action
        completion = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """
                You are a helpful assistant guiding users through a driving school registration form.
                When the user provides valid information for a field, use the fill_form_fields function to update it.
                
                Follow these rules:
                1. Focus on collecting information for the current field only
                2. When valid information is provided:
                   - ALWAYS call fill_form_fields with the field value
                3. Validate information before accepting it:
                   - Names should be non-empty strings
                   - Email should be in valid format
                   - Phone should be a valid number
                   - Date of birth should be YYYY-MM-DD
                   - Address should be non-empty
                   - For hasLicense, convert yes/no responses to true/false
                   - For transmission, accept only "automatic" or "manual"
                """
                },
                {"role": "user", "content": message}
            ],
            functions=[{
                "name": "fill_form_fields",
                "description": "Fill form fields with validated user information",
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
        result = {"text": response.content, "action": None}

        # If we got a function call but no text, make a second call for the response text
        if response.function_call and not response.content:
            fields = json.loads(response.function_call.arguments)
            result["action"] = {"type": "fillForm", "fields": fields}
            
            # Second call to get the response text
            text_completion = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": """
                    You are a helpful assistant guiding users through a driving school registration form.
                    Acknowledge the information just provided and ask for the next piece of information.
                    Be friendly and conversational.
                    """},
                    {"role": "user", "content": message},
                    {"role": "assistant", "content": f"I've saved these details: {fields}. Please provide a friendly response and ask for the next information."}
                ]
            )
            result["text"] = text_completion.choices[0].message.content
        elif response.function_call:
            # If we have both function call and text, use them
            fields = json.loads(response.function_call.arguments)
            result["action"] = {"type": "fillForm", "fields": fields}

        return result