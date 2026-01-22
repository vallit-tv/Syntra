import os
from dotenv import load_dotenv
import db
import json

load_dotenv()

def check_wtm_config():
    print("Checking WTM Consulting configuration...")
    
    # 1. Get Company ID
    try:
        companies = db.get_companies()
        wtm_company = None
        for company in companies:
            if 'WTM' in company['name'] or 'Consulting' in company['name']:
                # Refine search to be safer if there are multiple
                if 'WTM' in company['name']: 
                     wtm_company = company
                     break
        
        if not wtm_company:
            print("❌ WTM Consulting company not found in DB.")
            return

        print(f"✅ Found Company: {wtm_company['name']} (ID: {wtm_company['id']})")
        
        # 2. Check Settings
        settings = wtm_company.get('settings', {})
        print("\n--- Company Settings ---")
        print(json.dumps(settings, indent=2, default=str))

        # 3. Check Widget Settings (if separate)
        widget_settings = wtm_company.get('widget_settings', {})
        print("\n--- Widget Settings ---")
        if widget_settings:
             print(json.dumps(widget_settings, indent=2, default=str))
        else:
            print("No widget_settings found in company record.")

        # 4. Check 'widget_configs' table
        print("\n--- Widget Configs Table ---")
        client = db.get_db()
        result = client.table('widget_configs').select('*').eq('company_id', wtm_company['id']).execute()
        
        if result.data:
            for config in result.data:
                print(f"Widget Config ID: {config.get('id')}")
                print(json.dumps(config, indent=2, default=str))
        else:
            print("No entries in 'widget_configs' table for this company.")

    except Exception as e:
        print(f"❌ Error checking config: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_wtm_config()
