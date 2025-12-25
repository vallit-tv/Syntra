"""Chat Service - ChatGPT API integration and n8n workflow handling"""
import os
import json
import uuid
import requests
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
from dotenv import load_dotenv

load_dotenv()


class ChatService:
    """Service for AI chat functionality with ChatGPT and n8n integration"""
    
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY', '')
        self.openai_model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
        self.n8n_chat_webhook_url = os.getenv('N8N_CHAT_WEBHOOK_URL', '')
        self.default_system_prompt = os.getenv('CHAT_SYSTEM_PROMPT', 
            "You are a helpful AI assistant. Be concise, friendly, and helpful.")
    
    def is_configured(self) -> bool:
        """Check if OpenAI API is configured"""
        return bool(self.openai_api_key)
    
    def has_n8n_integration(self) -> bool:
        """Check if n8n webhook is configured"""
        return bool(self.n8n_chat_webhook_url)
    
    # =========================================================================
    # Session Management
    # =========================================================================
    
    def get_or_create_session(self, db_module, session_key: str, 
                               widget_id: str = None,
                               user_id: str = None,
                               context: Dict = None,
                               metadata: Dict = None) -> Tuple[Dict, bool]:
        """Get existing session or create new one
        
        Returns:
            Tuple of (session_dict, is_new)
        """
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
            session_data = {
                'session_key': session_key,
                'widget_id': widget_id,
                'user_id': user_id,
                'context': context or {},
                'metadata': metadata or {},
                'is_active': True
            }
            
            result = db_client.table('chat_sessions').insert(session_data).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0], True
            
            return None, False
            
        except Exception as e:
            print(f"Error in get_or_create_session: {e}")
            return None, False
    
    def update_session_context(self, db_module, session_id: str, context: Dict) -> bool:
        """Update session context data"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                return False
            db_client.table('chat_sessions').update({
                'context': context
            }).eq('id', session_id).execute()
            return True
        except Exception as e:
            print(f"Error updating session context: {e}")
            return False
    
    # =========================================================================
    # Message Management
    # =========================================================================
    
    def save_message(self, db_module, session_id: str, role: str, content: str,
                     tokens_used: int = None, model: str = None,
                     metadata: Dict = None, n8n_execution_id: str = None) -> Optional[Dict]:
        """Save a message to the database"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                print("Database not available for saving message")
                return None
            
            message_data = {
                'session_id': session_id,
                'role': role,
                'content': content,
                'tokens_used': tokens_used,
                'model': model,
                'metadata': metadata or {},
                'n8n_execution_id': n8n_execution_id
            }
            
            result = db_client.table('chat_messages').insert(message_data).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error saving message: {e}")
            return None
    
    def get_conversation_history(self, db_module, session_id: str, 
                                  limit: int = 50) -> List[Dict]:
        """Get conversation history for a session"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                return []
            
            result = db_client.table('chat_messages').select('*').eq(
                'session_id', session_id
            ).order('created_at', desc=False).limit(limit).execute()
            
            return result.data if result.data else []
            
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
    
    def generate_response(self, messages: List[Dict], 
                          system_prompt: str = None,
                          temperature: float = 0.7,
                          max_tokens: int = 1000) -> Tuple[Optional[str], Optional[Dict]]:
        """Generate AI response using ChatGPT API
        
        Returns:
            Tuple of (response_text, metadata)
        """
        if not self.is_configured():
            return None, {'error': 'OpenAI API not configured'}
        
        try:
            formatted_messages = self.format_messages_for_openai(
                messages, 
                system_prompt or self.default_system_prompt
            )
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.openai_api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': self.openai_model,
                    'messages': formatted_messages,
                    'temperature': temperature,
                    'max_tokens': max_tokens
                },
                timeout=60
            )
            
            if response.status_code != 200:
                error_text = response.text[:500]
                print(f"OpenAI API error: {response.status_code} - {error_text}")
                return None, {'error': f'API error: {response.status_code}'}
            
            data = response.json()
            
            # Extract response
            ai_message = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            usage = data.get('usage', {})
            
            metadata = {
                'model': data.get('model'),
                'tokens_prompt': usage.get('prompt_tokens'),
                'tokens_completion': usage.get('completion_tokens'),
                'tokens_total': usage.get('total_tokens'),
                'finish_reason': data.get('choices', [{}])[0].get('finish_reason')
            }
            
            return ai_message, metadata
            
        except requests.exceptions.Timeout:
            return None, {'error': 'Request timeout'}
        except Exception as e:
            print(f"Error generating response: {e}")
            return None, {'error': str(e)}
    
    # =========================================================================
    # n8n Integration
    # =========================================================================
    
    def trigger_n8n_workflow(self, session_id: str, message: str,
                              user_context: Dict = None,
                              conversation_history: List[Dict] = None) -> Tuple[bool, Optional[str]]:
        """Trigger n8n workflow for AI processing
        
        Returns:
            Tuple of (success, execution_id or error)
        """
        if not self.has_n8n_integration():
            return False, 'n8n webhook not configured'
        
        try:
            payload = {
                'session_id': session_id,
                'message': message,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'context': user_context or {},
                'conversation_history': conversation_history or []
            }
            
            response = requests.post(
                self.n8n_chat_webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                # n8n may return execution ID or direct response
                try:
                    data = response.json()
                    execution_id = data.get('executionId') or data.get('execution_id')
                    return True, execution_id
                except:
                    return True, None
            else:
                return False, f'n8n error: HTTP {response.status_code}'
                
        except requests.exceptions.Timeout:
            return False, 'n8n webhook timeout'
        except Exception as e:
            print(f"Error triggering n8n workflow: {e}")
            return False, str(e)
    
    # =========================================================================
    # Widget Configuration
    # =========================================================================
    
    def get_widget_config(self, db_module, widget_id: str) -> Optional[Dict]:
        """Get widget configuration by ID"""
        try:
            db_client = db_module.get_db()
            if db_client is None:
                return None
            
            result = db_client.table('widget_configs').select('*').eq(
                'widget_id', widget_id
            ).eq('is_active', True).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error getting widget config: {e}")
            return None
    
    def get_default_widget_config(self) -> Dict:
        """Get default widget configuration"""
        return {
            'widget_id': 'default',
            'name': 'AI Assistant',
            'theme': 'glassmorphism',
            'position': 'bottom-right',
            'system_prompt': self.default_system_prompt,
            'welcome_message': "Hi! 👋 I'm your AI assistant. How can I help you today?",
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
