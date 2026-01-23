import os
import json
import logging
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
from appointment_service import AppointmentService

class CompanyBot:
    def __init__(self, company_id: str, db_module, config: Dict = None):
        self.company_id = company_id
        self.db = db_module
        
        # Load config from DB if not provided
        if not config:
            self.config = self._load_config()
        else:
            self.config = config
            
        self.openai_api_key = os.getenv('OPENAI_API_KEY', '')
        self.openai_model = os.getenv('OPENAI_MODEL', 'gpt-4o')
        
    def _load_config(self) -> Dict:
        """Load company-specific bot settings"""
        try:
            company = self.db.get_company_by_id(self.company_id)
            if not company:
                return {}
            
            # Default settings if none exist
            defaults = {
                'name': 'Kian',
                'system_prompt': 'You are a helpful assistant for this company.',
                'model': 'gpt-4o',
                'temperature': 0.7
            }
            
            # Merge stored settings
            settings = company.get('widget_settings', {})
            
            # Map simplified settings to config
            return {
                'name': settings.get('bot_name', defaults['name']),
                'system_prompt': settings.get('instructions') or settings.get('system_prompt') or defaults['system_prompt'],
                'model': settings.get('model', defaults['model']),
                'temperature': settings.get('temperature', defaults['temperature']),
                'welcome_message': settings.get('welcome_message', "Hello! How can I help you?")
            }
        except Exception as e:
            logging.error(f"Error loading bot config for {self.company_id}: {e}")
            return {}

    def get_appointment_tool_def(self):
        """Define the appointment booking tool for OpenAI"""
        return {
            "type": "function",
            "function": {
                "name": "book_appointment",
                "description": "Book a consultation or appointment for the user. Call this ONLY after completing the full data collection process (Name, Company, Email, Time).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "The user's full name"
                        },
                        "company_name": {
                            "type": "string",
                            "description": "The name of the user's company (Required for B2B booking)"
                        },
                        "email": {
                            "type": "string",
                            "description": "The user's email address"
                        },
                        "date_time": {
                            "type": "string",
                            "description": "The preferred date and time for the appointment (ISO format)"
                        },
                        "topic_type": {
                            "type": "string",
                            "enum": ["Seminar", "Coaching", "Team Building", "General"],
                            "description": "The type of service the user is interested in"
                        },
                        "purpose": {
                            "type": "string",
                            "description": "Detailed reason or specific seminar name"
                        }
                    },
                    "required": ["name", "company_name", "email", "date_time", "topic_type"]
                }
            }
        }

    def generate_response(self, messages: List[Dict], 
                        user_context: Dict = None, 
                        system_prompt: str = None, 
                        enable_tools: bool = False,
                        session_id: str = None) -> Dict:
        """
        Generate a response with optional tool support
        """
        if not self.openai_api_key:
            return {'error': 'OpenAI API not configured'}

        # Priority: Passed system_prompt > Config system_prompt
        final_system_prompt = system_prompt or self.config.get('system_prompt', '')
        
        # Inject Company Knowledge Base
        try:
            knowledge = self.db.get_company_knowledge(self.company_id)
            if knowledge:
                 final_system_prompt += f"\n\n### INTERNAL KNOWLEDGE BASE ###\n{knowledge}\n"
        except Exception as e:
            logging.error(f"Failed to inject knowledge base: {e}")

        # Add basic context if not already included in system_prompt
        if "IMPORTANT:" not in final_system_prompt:
             final_system_prompt += f"\n\nIMPORTANT: Current Time: {datetime.utcnow().isoformat()}"

        # Context Injection (RAG lite) - if enabled in future
        # For now, we rely on what passed in via system_prompt or base knowledge
        
        api_messages = [{'role': 'system', 'content': final_system_prompt}]
        for m in messages:
            api_messages.append({'role': m['role'], 'content': m['content']})

        payload = {
            'model': self.config.get('model', self.openai_model),
            'messages': api_messages,
            'temperature': self.config.get('temperature', 0.7)
        }

        if enable_tools:
            payload['tools'] = [self.get_appointment_tool_def()]
            payload['tool_choice'] = "auto"

        try:
            logging.info(f"Sending request to OpenAI using model: {payload['model']}")
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.openai_api_key}',
                    'Content-Type': 'application/json'
                },
                json=payload,
                timeout=30
            )

            if response.status_code != 200:
                error_msg = f"Provider Error: {response.status_code} - {response.text}"
                logging.error(f"OpenAI Error: {error_msg}")
                print(f"FAILED OPENAI CALL: {error_msg}") # Force stdout for user visibility
                return {'error': error_msg}

            data = response.json()
            choice = data['choices'][0]
            message = choice['message']
            
            # Handle Tool Calls
            if message.get('tool_calls'):
                print("--- Tool Call Detected ---")
                tool_calls = message['tool_calls']
                api_messages.append(message) # Append assistant's tool call message
                
                for tool_call in tool_calls:
                    function_name = tool_call['function']['name']
                    arguments_str = tool_call['function']['arguments']
                    print(f"Tool: {function_name}, Args: {arguments_str}")
                    
                    try:
                        arguments = json.loads(arguments_str)
                    except Exception as json_e:
                        print(f"JSON Parse Error: {json_e}")
                        arguments = {}

                    if function_name == 'book_appointment':
                        # Execute tool
                        try:
                            print(f"Executing AppointmentService...")
                            result = AppointmentService.create_appointment(
                                self.db,
                                self.company_id,
                                session_id,
                                arguments.get('name'),
                                arguments.get('email'),
                                arguments.get('date_time'),
                                arguments.get('purpose', 'General Consultation'),
                                company_name=arguments.get('company_name'),
                                topic_type=arguments.get('topic_type')
                            )
                            print(f"Appointment Result: {result}")
                            
                            output_content = json.dumps({"status": "success", "details": str(result)}) if result else json.dumps({"status": "error", "message": "Failed to book appointment"})
                        except Exception as e:
                            print(f"Tool Execution Error: {str(e)}")
                            output_content = json.dumps({"status": "error", "message": str(e)})

                        api_messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call['id'],
                            "name": function_name,
                            "content": output_content
                        })

                # Follow-up request to get final answer
                payload['messages'] = api_messages
                
                print("Sending Follow-up to OpenAI...")
                response = requests.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {self.openai_api_key}',
                        'Content-Type': 'application/json'
                    },
                    json=payload,
                    timeout=30
                )
                
                if response.status_code != 200:
                    error_msg = f"Provider Error (Follow-up): {response.status_code} - {response.text}"
                    logging.error(f"OpenAI Error: {error_msg}")
                    print(f"FAILED OPENAI CALL: {error_msg}")
                    return {'error': "Error generating final response after tool use"}
                    
                data = response.json()
                content = data['choices'][0]['message']['content']
            else:
                content = message['content']

            return {
                'role': 'assistant',
                'content': content,
                'metadata': {
                    'model': data['model'],
                    'tokens': data['usage']['total_tokens']
                }
            }

        except Exception as e:
            logging.error(f"Generation error: {e}")
            import traceback
            traceback.print_exc() # Print full stack trace to stdout
            print(f"CRITICAL BOT ERROR: {str(e)}")
            return {'error': str(e)}
