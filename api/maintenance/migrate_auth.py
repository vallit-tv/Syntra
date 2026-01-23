
import os
import time
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('.env')

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: Config missing")
    exit(1)

supabase = create_client(url, key)

def migrate():
    # 1. Fetch all users from public.users (your custom table)
    # Adjust table name if it's different in db.py, usually strictly 'users' or 'profiles'
    response = supabase.table('users').select('*').execute()
    users = response.data
    
    print(f"Found {len(users)} users in custom DB.")

    for u in users:
        name = u.get('name')
        if not name: continue
        
        email = f"{name}@syntra.internal".lower()
        password = "password123" # Default password for migration, user should change it
        
        print(f"Migrating {name} -> {email}...")
        
        try:
            # Check if exists in auth (by trying to create, or listing)
            # admin.create_user auto-verifies email
            res = supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": { "name": name, "role": u.get('role', 'worker') }
            })
            print(f"  Success: {res.user.id}")
        except Exception as e:
            if "already registered" in str(e) or "already exists" in str(e):
                print(f"  User {email} already exists in Auth.")
                # Optional: Update password if needed, but skipping for safety
            else:
                print(f"  Error: {e}")

if __name__ == "__main__":
    migrate()
