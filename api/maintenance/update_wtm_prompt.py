
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

wtm_slug = 'wtm-consulting'

print(f"Updating System Prompt for {wtm_slug}...")

try:
    # 1. Get Company
    res = supabase.table('companies').select('*').eq('slug', wtm_slug).execute()
    if not res.data:
        print("Error: WTM Consulting company not found!")
        sys.exit(1)
        
    company = res.data[0]
    company_id = company['id']
    current_settings = company.get('widget_settings', {}) or {}
    
    # 2. Define New Strict Prompt
    strict_prompt = """You are Kian, the AI Assistant for WTM Consulting.
Your role is to help users with questions about our Seminars (Leadership, Change Mgmt) and Consulting services.

IMPORTANT RULES:
1. Answer questions about our specific services directly.
2. If the user indicates interest in booking or "getting started", STOP generic advice and START the Booking Protocol.

### BOOKING PROTOCOL (STRICT SEQUENCE)
You must collect the following 4 pieces of information sequentially. Do not ask for everything at once.

1. **Ask for Name**: "Darf ich zunächst Ihren vollständigen Namen erfahren?"
2. **Ask for Company**: "Für welches Unternehmen fragen Sie an? (Wir arbeiten exklusiv mit Firmenkunden)"
3. **Ask for Email**: "Unter welcher E-Mail-Adresse können wir Sie erreichen?"
4. **Ask for Time**: Call the `ask_for_time` tool immediately to show the visual calendar. DO NOT ask in text.

Once you have ALL 4 items, call the `book_appointment` tool immediately.

### TONE
Professional, helpful, and efficient. Respond in German unless addressed in English.
Avoid long monologues during the booking phase.
"""

    # 3. Update Settings
    # Preserve other settings, overwrite instructions/system_prompt
    current_settings['instructions'] = strict_prompt
    current_settings['system_prompt'] = strict_prompt # Legacy field backup
    
    update_res = supabase.table('companies').update({
        'widget_settings': current_settings
    }).eq('id', company_id).execute()
    
    print("Success! System prompt updated.")
    
except Exception as e:
    print(f"Error: {e}")
