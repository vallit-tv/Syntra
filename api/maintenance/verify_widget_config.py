import os
import sys
import json
from dotenv import load_dotenv

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chat_service import get_chat_service
import db

load_dotenv()

def test_widget_config():
    print("Testing Widget Config Retrieval...")
    
    # 1. Test DB Connection first
    print("Checking DB connection...")
    is_connected, err = db.test_db_connection()
    if not is_connected:
        print(f"❌ DB Connection Failed: {err}")
        return

    service = get_chat_service()
    
    # 2. Test generic config
    print("\nTest 1: Default Config")
    config = service.get_widget_config(db, 'default')
    print(f"Default Config: {json.dumps(config, indent=2, default=str)}")
    
    # 3. Test WTM config (using the ID from previous logs)
    # e46176c5-0f35-43b8-8e8c-c72f534519e1
    company_id = 'e46176c5-0f35-43b8-8e8c-c72f534519e1'
    print(f"\nTest 2: WTM Config for {company_id}")
    wtm_config = service.get_widget_config(db, 'default', company_id=company_id)
    print(f"WTM Config: {json.dumps(wtm_config, indent=2, default=str)}")

if __name__ == "__main__":
    test_widget_config()
