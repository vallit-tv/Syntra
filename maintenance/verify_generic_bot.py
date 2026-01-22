import os
import sys
import json
from dotenv import load_dotenv

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chat_service import get_chat_service
import db

load_dotenv()

def test_generic_bot():
    print("Testing Generic Bot (No Company ID)...")
    service = get_chat_service()
    
    # Mock message from the new frontend
    messages = [
        {'role': 'user', 'content': 'What can you do?'}
    ]
    
    # Simulate the call from app.py -> api_chat_message
    # company_id is None for generic bot
    company_id = None 
    widget_id = "vallit-web"
    session_id = "test-generic-session"
    
    print(f"1. Getting Widget Config for {widget_id}...")
    widget_config = service.get_widget_config(db, widget_id, company_id)
    if not widget_config:
        print("   -> Fallback to default config")
        widget_config = service.get_default_widget_config()
        
    print(f"   Config: {json.dumps(widget_config, indent=2)}")
    
    system_prompt = widget_config.get('system_prompt') or service.default_system_prompt
    
    print("\n2. Generating Response...")
    if service.is_configured():
        response, meta = service.generate_response(
            messages=messages,
            system_prompt=system_prompt,
            db_module=db,
            company_id=company_id,
            session_id=session_id
        )
        print(f"\n✅ Response: {response}")
        print(f"   Meta: {meta}")
    else:
        print("❌ OpenAI not configured")

if __name__ == "__main__":
    test_generic_bot()
