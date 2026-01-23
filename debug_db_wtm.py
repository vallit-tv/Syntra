from api import db
import os
import json

# Setup env for db connection (assuming .env is loaded by db module or we need to load it)
from dotenv import load_dotenv
load_dotenv()

def check_companies():
    client = db.get_db()
    
    print("\n--- Companies ---")
    res = client.table('companies').select('id, name, widget_settings').ilike('name', '%WTM%').execute()
    for c in res.data:
        print(f"ID: {c['id']}, Name: {c['name']}")
        print(f"Settings: {json.dumps(c.get('widget_settings'), indent=2)}")

    print("\n--- Widget Configs ---")
    res = client.table('widget_configs').select('*').execute()
    for w in res.data:
        print(f"WidgetID: {w['widget_id']} -> CompanyID: {w['company_id']}")

if __name__ == '__main__':
    check_companies()
