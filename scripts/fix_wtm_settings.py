
import os
import sys
import json
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def fix_wtm():
    load_dotenv()
    company_id = "5f929157-5f9e-48e3-b7f7-a6dcd0e24142"
    
    # New valid settings
    new_settings = {
        "bot_name": "WTM Assistant",
        "welcome_message": "Hallo! Wie kann ich Ihnen helfen?",
        "theme": "glassmorphism",
        "language": "de",
        "position": "bottom-right",
        "primary_color": "#2563eb",
        "instructions": "You are a helpful assistant for WTM Consulting."
    }
    
    print(f"Updating WTM settings for {company_id}...")
    try:
        res = db.get_db().table('companies').update({'widget_settings': new_settings}).eq('id', company_id).execute()
        print("Update Success!")
        print(json.dumps(res.data[0].get('widget_settings'), indent=2))
    except Exception as e:
        print(f"Update failed: {e}")

if __name__ == "__main__":
    fix_wtm()
