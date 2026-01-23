
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

user_id = "394f7999-7f46-4ab0-a90b-486837500f69"
company_id = "17eae5d5-9d10-40f0-a5ce-c576494069d3"

print(f"--- Checking Company: {company_id} ---")
try:
    c_data = supabase.table('companies').select('*').eq('id', company_id).execute()
    if c_data.data:
        print(f"Company Found: {c_data.data[0]['name']}")
    else:
        print("COMPANY NOT FOUND!")
except Exception as e:
    print(f"Error checking company: {e}")

print(f"\n--- Updating Role for User: {user_id} ---")
try:
    # Force update Role to 'admin'
    res = supabase.table('users').update({
        'role': 'admin',
        'company_id': company_id # Re-assert this just in case
    }).eq('id', user_id).execute()
    
    print(f"Update Result: {res.data}")
except Exception as e:
    print(f"Error updating user: {e}")
