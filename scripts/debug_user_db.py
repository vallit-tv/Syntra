
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in env")
    sys.exit(1)

supabase = create_client(url, key)

print("--- Listing ALL Users in 'public.users' ---")
try:
    data = supabase.table('users').select('*').execute()
    users = data.data
    
    if not users:
        print("Table 'users' is EMPTY.")
    else:
        print(f"Found {len(users)} users.")
        for u in users:
            print(f"\nUser ID: {u.get('id')}")
            print(f"Name: {u.get('name')}")
            # print(f"Email: {u.get('email')}") # Column missing confirmed
            print(f"Company ID: {u.get('company_id')}")
            print(f"Role: {u.get('role')}")

except Exception as e:
    print(f"Error fetching users: {e}")
