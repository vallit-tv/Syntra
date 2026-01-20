"""
Company Bot Engine
Encapsulates all logic for a specific company's chatbot instance.
"""
import os
import json
import logging
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime

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

    def get_system_prompt(self) -> str:
        """Construct the full system prompt including context"""
        base_prompt = self.config.get('system_prompt', '')
        
        company_context_str = self.db.get_company_knowledge(self.company_id)
        # For now, we'll keep the simple knowledge base fetch or upgrade it later
        
        prompt = f"""You are {self.config.get('name')}, an AI assistant.
        
{base_prompt}

IMPORTANT:
- Answer based on the provided context if available.
- Be concise and professional.
- Current Time: {datetime.utcnow().isoformat()}
"""
        return prompt

    def generate_response(self, messages: List[Dict], user_context: Dict = None) -> Dict:
        """
        Generate a response for the user.
        messages: List of {'role': 'user'|'assistant', 'content': '...'}
        """
        if not self.openai_api_key:
            return {'error': 'OpenAI API not configured'}

        system_prompt = self.get_system_prompt()
        
        # Context Injection (RAG lite)
        last_msg = messages[-1]['content'] if messages else ""
        if last_msg:
            # Reuse the existing context logic or a new one
            # context = self.db.get_rag_context(self.company_id, last_msg)
            # if context: system_prompt += f"\n\nCONTEXT:\n{context}"
            pass

        # Format for OpenAI
        api_messages = [{'role': 'system', 'content': system_prompt}]
        for m in messages:
            api_messages.append({'role': m['role'], 'content': m['content']})

        try:
            payload = {
                'model': self.config.get('model', self.openai_model),
                'messages': api_messages,
                'temperature': self.config.get('temperature', 0.7)
            }
            
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
                logging.error(f"OpenAI Error: {response.text}")
                return {'error': f"Provider Error: {response.status_code}"}
                
            data = response.json()
            content = data['choices'][0]['message']['content']
             
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
            return {'error': str(e)}
