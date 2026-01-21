
import os
import sys
from dotenv import load_dotenv

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import db

def debug_wtm():
    load_dotenv()
    
    company_id = "5f929157-5f9e-48e3-b7f7-a6dcd0e24142"
    print(f"Checking company: {company_id}")
    
    if not db.is_db_configured():
        print("DB not configured")
        return

    company = db.get_company_by_id(company_id)
    if not company:
        print("Company NOT FOUND")
        return
        
    print(f"Found Company: {company.get('name')} ({company.get('slug')})")
    print("\n--- Widget Settings ---")
    import json
    settings = company.get('widget_settings', {})
    print(json.dumps(settings, indent=2))
    
    # Check if that string is in there
    settings_str = str(settings)
    if "Kontaktformular" in settings_str:
        print("\n\n!!! FOUND THE ERROR MESSAGE IN SETTINGS !!!")
    else:
        print("\n\nMessage 'Kontaktformular' NOT found in settings.")
        
    print("\n--- Legacy Widget Configs ---")
    try:
        res = db.get_db().table('widget_configs').select('*').eq('company_id', company_id).execute()
        for conf in res.data:
            print(f"ID: {conf.get('id')}")
            print(f"Welcome: {conf.get('welcome_message')}")
            if "Kontaktformular" in str(conf):
                 print("!!! FOUND IN LEGACY !!!")
    except Exception as e:
        print(f"Legacy check failed: {e}")

if __name__ == "__main__":
    debug_wtm()
