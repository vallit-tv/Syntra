
import sys
import os
import json

# Add parent dir to path to import db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import db

def list_users():
    try:
        supabase = db.get_db()
        # Fetch all users
        res = supabase.table('users').select('*').execute()
        users = res.data
        print(f"Found {len(users)} users:")
        for u in users:
            print(f"- ID: {u.get('id')}, Email: {u.get('email')}, Name: {u.get('name')}, Company: {u.get('company_id')}")
            
    except Exception as e:
        print(f"Error listing users: {e}")

if __name__ == "__main__":
    list_users()
