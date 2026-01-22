
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

print("--- 1. Checking Schema (Email Column) ---")
try:
    # Try to select email to see if it errors
    res = supabase.table('users').select('email').limit(1).execute()
    print("Email column EXISTS.")
except Exception as e:
    print(f"Schema Check Failed: {e}")
    print("User likely hasn't run the migration yet.")
    # Proceed anyway, checking by name?

print("\n--- 2. Checking WTM Company ---")
wtm_slug = 'wtm-consulting'
wtm_name = 'WTM Consulting'
wtm_id = None

try:
    res = supabase.table('companies').select('*').eq('slug', wtm_slug).execute()
    if res.data:
        print(f"WTM Company Found: {res.data[0]['id']}")
        wtm_id = res.data[0]['id']
    else:
        print("WTM Company NOT FOUND. Creating...")
        new_company = {
            'name': wtm_name,
            'slug': wtm_slug,
            'settings': {'bot_name': 'WTM Assistant', 'system_prompt': 'You are a helpful assistant for WTM Consulting.'}
        }
        res = supabase.table('companies').insert(new_company).execute()
        wtm_id = res.data[0]['id']
        print(f"Created WTM: {wtm_id}")
except Exception as e:
    print(f"Error checking/creating WTM: {e}")

print("\n--- 3. Checking User Membership ---")
user_id = '394f7999-7f46-4ab0-a90b-486837500f69' # Theorei

# In current simple schema, user has ONE company_id. 
# We need to decide: does he switch by changing this ID? Yes.
# But does he have a record in 'company_members' table?
# db.py implies 'get_company_members' queries 'users' table by company_id.
# This means DB structure is strictly 1-User-1-Company currently?
# Let's check db.py get_company_members again.

# Line 574: result = get_db().table('users').select('*').eq('company_id', company_id)...
# YES. db.py CONFIRMS 'company_members' is NOT a separate table, it just queries the 'users' table!
# This means a user can ONLY belong to one company at a time in the current architecture.
# To query/manage WTM, he must SWITCH his `company_id`.

if wtm_id:
    print(f"To MANAGE WTM, user must switch 'company_id' to {wtm_id}")
    # We don't force it now, we let the UI do it.
