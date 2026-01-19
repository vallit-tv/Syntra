import os
import sys
from dotenv import load_dotenv

# Add parent dir to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chat_service import get_chat_service
import db

load_dotenv()

def test_chat():
    print("Initializing Chat Service...")
    service = get_chat_service()
    
    # Mock message history
    messages = [
        {'role': 'user', 'content': 'hey'}
    ]
    
    print("\nTest 1: Simple Greeting 'hey'")
    response, meta = service.generate_response(
        messages=messages,
        db_module=db,
        company_id='wtm-demo-id', # Mock ID, assumes generic logic doesn't crash
        session_id='test-session'
    )
    
    print(f"Response: {response}")
    
    if response:
        print("✅ Backend Logic: Success")
    else:
        print("❌ Backend Logic: Failed (Empty response)")
        print(f"Meta: {meta}")

    print("\nTest 2: WTM Booking Intent 'I want to book an appointment'")
    messages = [
        {'role': 'user', 'content': 'I want to book an appointment'}
    ]
    
    # We need a valid company_id for the tool to work fully, but let's see if it tries
    # We can use the one from the previous log: e46176c5-0f35-43b8-8e8c-c72f534519e1 (WTM)
    company_id = 'e46176c5-0f35-43b8-8e8c-c72f534519e1'
    
    response, meta = service.generate_response(
        messages=messages,
        db_module=db,
        company_id=company_id,
        session_id='test-session-booking',
        enable_tools=True
    )
    print(f"Response: {response}")
    print(f"Meta: {meta}")

if __name__ == "__main__":
    test_chat()
