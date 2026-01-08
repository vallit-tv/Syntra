"""Chat Service - ChatGPT API integration and n8n workflow handling"""
import os
import json
import uuid
import requests
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
from dotenv import load_dotenv
import chat_analytics

load_dotenv()


class ChatService:
    """Service for AI chat functionality with ChatGPT and n8n integration"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY', '')
        self.openai_model = os.getenv('OPENAI_MODEL', 'gpt-4o')

        
        # Guardrailed System Prompt
        self.default_system_prompt = """You are Kian, an AI assistant created by Vallit Network.
Your role is to help users with questions about THIS company ONLY, based on the provided context.

IMPORTANT IDENTITY:
- Your name is "Kian"
- You were created by "Vallit Network" (vallit.net)
- You are an AI Agent designed to assist with company-specific inquiries

CRITICAL RULES:
1. You must ONLY answer questions related to the company's services, products, philosophy, and internal knowledge provided in the context.
2. If a user asks about:
   - Competitors (e.g., McKinsey, BCG, other local firms)
   - General world knowledge unrelated to the company (e.g., "Write me a python script", "What is the capital of France?")
   - Personal opinions or topics outside the company's scope
   
   You MUST politely DECLINE to answer and steer the conversation back to this company's offerings.
   
   Example Refusal: "I specialize in [Company Name] and cannot discuss other companies or general topics. How can I help you with our coaching or consulting services?"

3. Be helpful, professional, and concise.
4. If you use the 'book_appointment' tool, wait for the user to provide Name, Email, and Time.
"""
    
    def is_configured(self) -> bool:
        """Check if OpenAI API is configured"""
        return bool(self.openai_api_key)
    

    
    # =========================================================================
    # Session Management
    # =========================================================================
    
    def get_or_create_session(self, db_module, session_key: str, 
                               widget_id: str = None,
                               user_id: str = None,
                               company_id: str = None,
                               context: Dict = None,
                               metadata: Dict = None) -> Tuple[Dict, bool]:
        """Get existing session or create new one"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                print("Database not available for chat session")
                return None, False
            
            # Try to get existing session
            result = db_client.table('chat_sessions').select('*').eq(
                'session_key', session_key
            ).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0], False
            
            # Create new session
            # Note: We use session_key as the session_id column for client mapping
            # user_id must be valid UUID or None (if FK). Store anon ID in metadata.
            anon_id = f"anon_{uuid.uuid4().hex[:8]}"
            
            session_data = {
                'session_key': session_key,
                'widget_id': widget_id,
                'user_id': user_id, # Must be UUID or None
                'company_id': company_id,
                'metadata': metadata or {'messages': [], 'anon_id': anon_id}, # Init messages in metadata
                'is_active': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # If context provided, add to metadata
            if context:
                session_data['metadata']['context'] = context
            
            result = db_client.table('chat_sessions').insert(session_data).execute()
            
            if result.data and len(result.data) > 0:
                # Track new session creation in analytics
                if company_id:
                    chat_analytics.track_session(company_id)
                return result.data[0], True
            
            return None, False
            
        except Exception as e:
            print(f"Error in get_or_create_session: {e}")
            return None, False
    
    def update_session_context(self, db_module, session_id_rec: str, context: Dict) -> bool:
        """Update session context data (metadata)"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                return False
                
            # Fetch current metadata first
            session = db_client.table('chat_sessions').select('metadata').eq('id', session_id_rec).execute()
            if not session.data:
                return False
                
            current_meta = session.data[0].get('metadata', {})
            current_meta['context'] = context
            
            db_client.table('chat_sessions').update({
                'metadata': current_meta,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', session_id_rec).execute()
            return True
        except Exception as e:
            print(f"Error updating session context: {e}")
            return False

    def close_session(self, db_module, session_id_rec: str) -> bool:
        """Close a chat session"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                return False
            
            db_client.table('chat_sessions').update({
                'is_active': False,
                'closed_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', session_id_rec).execute()
            
            return True
        except Exception as e:
            print(f"Error closing session: {e}")
            return False
    
    # =========================================================================
    # Message Management
    # =========================================================================
    
    def save_message(self, db_module, session_id_rec: str, role: str, content: str,
                     tokens_used: int = None, model: str = None,
                     metadata: Dict = None,
                     company_id: str = None) -> Optional[Dict]:
        """Save a message to the database (append to JSONB) and track analytics"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                return None
            
            msg_id = str(uuid.uuid4())
            message = {
                'id': msg_id,
                'role': role,
                'content': content,
                'timestamp': datetime.utcnow().isoformat(),
                'tokens_used': tokens_used,
                'model': model,
                'metadata': metadata or {}
            }
            
            # 1. Fetch current messages
            # Note: We use the internal UUID (id) for updates if possible, or session_id key
            # The session object passed usually has 'id' (UUID) if fetched from table
            
            # Check if session_id_rec is UUID or key. Assuming UUID from previous fetch.
            # But let's be safe. If it looks like UUID use id, else session_id.
            
            # Fetch current metadata
            key_col = 'id' # Default to PK lookup
            result = db_client.table('chat_sessions').select('metadata').eq(key_col, session_id_rec).execute()
            
            if not result.data:
                # Try lookup by session_key (string key)
                key_col = 'session_key'
                result = db_client.table('chat_sessions').select('metadata').eq(key_col, session_id_rec).execute()
                if not result.data:
                    return None
            
            current_meta = result.data[0].get('metadata', {}) or {}
            current_messages = current_meta.get('messages', [])
            
            if not isinstance(current_messages, list):
                current_messages = []
                
            current_messages.append(message)
            current_meta['messages'] = current_messages
            
            # 2. Update array in metadata
            db_client.table('chat_sessions').update({
                'metadata': current_meta,
                'updated_at': datetime.utcnow().isoformat()
            }).eq(key_col, session_id_rec).execute()
            
            # Track analytics for assistant responses
            if role == 'assistant' and company_id and tokens_used:
                chat_analytics.track_message(
                    company_id, 
                    tokens_used=tokens_used
                )
            
            return message
            
        except Exception as e:
            print(f"Error saving message: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def get_conversation_history(self, db_module, session_id_rec: str, 
                                  limit: int = 50) -> List[Dict]:
        """Get conversation history for a session from JSONB"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                return []
            
            # Try UUID first
            result = db_client.table('chat_sessions').select('metadata').eq('id', session_id_rec).execute()
            
            if not result.data:
                # Try session_key
                result = db_client.table('chat_sessions').select('metadata').eq('session_key', session_id_rec).execute()
            
            if result.data and result.data[0]:
                meta = result.data[0].get('metadata', {})
                msgs = meta.get('messages', [])
                # Return last N messages. JSONB array is ordered by insertion.
                if limit and len(msgs) > limit:
                    return msgs[-limit:]
                return msgs
            
            return []
            
        except Exception as e:
            print(f"Error getting conversation history: {e}")
            return []
    
    def format_messages_for_openai(self, messages: List[Dict], 
                                    system_prompt: str = None) -> List[Dict]:
        """Format database messages for OpenAI API"""
        formatted = []
        
        # Add system prompt
        if system_prompt:
            formatted.append({
                'role': 'system',
                'content': system_prompt
            })
        
        # Add conversation messages
        for msg in messages:
            formatted.append({
                'role': msg.get('role', 'user'),
                'content': msg.get('content', '')
            })
        
        return formatted
    
    # =========================================================================
    # AI Response Generation
    # =========================================================================
    
    # =========================================================================
    # AI Response Generation (Enhanced with Tools)
    # =========================================================================
    
    def get_appointment_tool_def(self):
        """Define the appointment booking tool for OpenAI"""
        return {
            "type": "function",
            "function": {
                "name": "book_appointment",
                "description": "Book a consultation or appointment for the user. Call this ONLY when you have collected the user's Name, Email, and Preferred Date/Time.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "The user's full name"
                        },
                        "email": {
                            "type": "string",
                            "description": "The user's email address"
                        },
                        "date_time": {
                            "type": "string",
                            "description": "The preferred date and time for the appointment (ISO format or clear description like 'Next Monday at 10am')"
                        },
                        "purpose": {
                            "type": "string",
                            "description": "The reason for the appointment"
                        }
                    },
                    "required": ["name", "email", "date_time"]
                }
            }
        }

    def generate_response(self, messages: List[Dict], 
                          system_prompt: str = None,
                          temperature: float = 0.7,
                          max_tokens: int = 1000,
                          db_module = None,
                          company_id: str = None,
                          session_id: str = None,
                          enable_tools: bool = False) -> Tuple[Optional[str], Optional[Dict]]:
        """Generate AI response using ChatGPT API, supporting Tools"""
        
        if not self.is_configured():
            return None, {'error': 'OpenAI API not configured'}
        
        try:
            formatted_messages = self.format_messages_for_openai(
                messages, 
                system_prompt or self.default_system_prompt
            )
            
            payload = {
                'model': self.openai_model,
                'messages': formatted_messages,
                'temperature': temperature,
                'max_tokens': max_tokens
            }
            
            # Add tools if enabled
            if enable_tools:
                payload['tools'] = [self.get_appointment_tool_def()]
                payload['tool_choice'] = "auto"

            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.openai_api_key}',
                    'Content-Type': 'application/json'
                },
                json=payload,
                timeout=60
            )
            
            if response.status_code != 200:
                error_text = response.text[:500]
                print(f"OpenAI API error: {response.status_code} - {error_text}")
                return None, {'error': f'API error: {response.status_code}'}
            
            data = response.json()
            choice = data.get('choices', [{}])[0]
            message_obj = choice.get('message', {})
            
            # Check for tool calls
            tool_calls = message_obj.get('tool_calls')
            
            content = message_obj.get('content')
            
            # If tool called, execute it
            if tool_calls and db_module and company_id:
                # Append assistant message with tool calls to history (virtual)
                formatted_messages.append(message_obj)
                
                for tool_call in tool_calls:
                    function_name = tool_call['function']['name']
                    arguments = json.loads(tool_call['function']['arguments'])
                    
                    tool_result = None
                    if function_name == 'book_appointment':
                        from appointment_service import AppointmentService
                        appt = AppointmentService.create_appointment(
                            db_module, company_id, session_id,
                            arguments.get('name'),
                            arguments.get('email'),
                            arguments.get('date_time'),
                            arguments.get('purpose', 'General')
                        )
                        if appt:
                            tool_result = "Appointment booked successfully! Reference ID: " + str(appt.get('id'))
                        else:
                            tool_result = "Failed to book appointment in database."
                    
                    # Append tool result to messages
                    formatted_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call['id'],
                        "name": function_name,
                        "content": str(tool_result)
                    })
                
                # Recursively call API with tool outputs to get final text
                payload['messages'] = formatted_messages
                # Remove tools for follow-up to prevent loops, or keep them? usually remove or auto
                payload.pop('tools', None) 
                payload.pop('tool_choice', None)

                response2 = requests.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {self.openai_api_key}',
                        'Content-Type': 'application/json'
                    },
                    json=payload,
                    timeout=60
                )
                
                data = response2.json()
                content = data.get('choices', [{}])[0].get('message', {}).get('content')

            usage = data.get('usage', {})
            
            metadata = {
                'model': data.get('model'),
                'tokens_prompt': usage.get('prompt_tokens'),
                'tokens_completion': usage.get('completion_tokens'),
                'tokens_total': usage.get('total_tokens'),
                'finish_reason': data.get('choices', [{}])[0].get('finish_reason')
            }
            
            return content, metadata
            
        except requests.exceptions.Timeout:
            return None, {'error': 'Request timeout'}
        except Exception as e:
            print(f"Error generating response: {e}")
            return None, {'error': str(e)}
    

    
    # =========================================================================
    # Widget Configuration
    # =========================================================================
    
    def get_company_context(self, db_module, company_id: str) -> Optional[Dict]:
        """Get company context for multi-tenant routing
        
        Args:
            db_module: Database module
            company_id: Company UUID
            
        Returns:
            Company context dict with id, name, slug, settings
        """
        if not company_id:
            return None
            
        try:
            db_client = db_module.get_db()
            if db_client is None:
                return None
            
            result = db_client.table('companies').select('*').eq(
                'id', company_id
            ).execute()
            
            if result.data and len(result.data) > 0:
                company = result.data[0]
                return {
                    'id': company.get('id'),
                    'name': company.get('name'),
                    'slug': company.get('slug'),
                    'settings': company.get('settings', {})
                }
            return None
            
        except Exception as e:
            print(f"Error getting company context: {e}")
            return None
    
    def get_company_knowledge(self, db_module, company_id: str) -> str:
        """Get formatted knowledge base content for a company"""
        try:
            db_client = db_module.get_db()
            if not db_client:
                return ""
            
            # Fetch active knowledge base entries
            result = db_client.table('company_knowledge_base').select('title, content').eq('company_id', company_id).eq('is_active', True).execute()
            
            if not result.data:
                return ""
                
            knowledge_text = "\n\n### Company Knowledge Base:\n"
            for entry in result.data:
                title = entry.get('title', 'Unknown')
                content = entry.get('content', '')
                # Truncate very long content if needed? For now, include all but limit total?
                # A simple truncation per entry to avoid blowing up context
                if len(content) > 2000:
                    content = content[:2000] + "...(truncated)"
                
                knowledge_text += f"---\nTitle: {title}\nContent:\n{content}\n"
                
            return knowledge_text
            
        except Exception as e:
            print(f"Error fetching knowledge base: {e}")
            return ""

    def get_widget_config(self, db_module, widget_id: str, 
                          company_id: str = None) -> Optional[Dict]:
        """Get widget configuration, prioritizing new widget_settings table"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                return None
            
            # 1. Try to get from modern 'widget_settings' table first (by company_id if available)
            # We need company_id for this. If not provided, we might be stuck unless we map widget_id -> company_id
            
            config = self.get_default_widget_config()
            
            if company_id:
                settings_result = db_client.table('widget_settings').select('settings').eq('company_id', company_id).execute()
                if settings_result.data:
                    settings = settings_result.data[0].get('settings', {})
                    
                    # Map new settings structure to flat config structure expected by app
                    # settings = { appearance: {theme...}, content: {headerTitle...}, bot: {instructions...} }
                    
                    if settings.get('appearance'):
                        config['theme'] = settings['appearance'].get('theme', config['theme'])
                    
                    if settings.get('content'):
                        config['name'] = settings['content'].get('headerTitle', config['name'])
                        config['welcome_message'] = settings['content'].get('welcomeMessage', config['welcome_message'])
                        config['placeholder_text'] = settings['content'].get('placeholderText', config['placeholder_text'])
                        
                    if settings.get('bot'):
                        # Append instructions to system prompt or store separately
                        instructions = settings['bot'].get('instructions', '')
                        if instructions:
                            config['system_prompt'] = f"{self.default_system_prompt}\n\nIMPORTANT INSTRUCTIONS:\n{instructions}"
                            
                    config['settings'] = settings # Keep raw settings too
                    return config

            # 2. Fallback to legacy 'widget_configs' if no modern settings or no company_id
            query = db_client.table('widget_configs').select('*').eq(
                'widget_id', widget_id
            ).eq('is_active', True)
            
            # Filter by company if specified
            if company_id:
                query = query.eq('company_id', company_id)
            
            result = query.execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
                
            # If we have company_id but no config found, return default
            if company_id:
                return config
                
            return None
            
        except Exception as e:
            print(f"Error getting widget config: {e}")
            return None
    
    def get_default_widget_config(self) -> Dict:
        """Get default widget configuration"""
        return {
            'widget_id': 'default',
            'name': 'Kian',
            'theme': 'glassmorphism',
            'position': 'bottom-right',
            'system_prompt': self.default_system_prompt,
            'welcome_message': "Hi! I'm Kian, your AI Agent. How can I help you today?",
            'placeholder_text': 'Type your message...',
            'primary_color': '#6366f1',
            'settings': {}
        }


# Global instance
_chat_service = None


def get_chat_service() -> ChatService:
    """Get the global chat service instance"""
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
