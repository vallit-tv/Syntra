
import sys
import os

# Add parent dir to path to import db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import db

def fix_user():
    target_name = "theorei@icloud.com"
    target_email = "theorei@icloud.com"
    
    print(f"Checking user by name: {target_name}")
    
    supabase = db.get_db()
    
    # 1. Find User by Name
    res = supabase.table('users').select('*').eq('name', target_name).execute()
    if not res.data:
        print("User not found by name!")
        # Try by email just in case
        res = supabase.table('users').select('*').eq('email', target_email).execute()
        if not res.data:
            print("User not found by email either!")
            return
            
    user = res.data[0]
    print(f"Found User: ID={user.get('id')}, Name={user.get('name')}, Email={user.get('email')}")
    
    # 2. Ensure Vallit Company Exists
    res_co = supabase.table('companies').select('*').eq('name', 'Vallit').execute()
    vallit_company = None
    if res_co.data:
        vallit_company = res_co.data[0]
        print(f"Found Vallit Company: {vallit_company['id']}")
    else:
        print("Vallit Company not found! Creating it...")
        new_co = db.create_company("Vallit", "vallit")
        vallit_company = new_co
        print(f"Created Vallit Company: {vallit_company['id']}")
        
    # 3. Prepare Updates
    updates = {}
    
    # Fix Email if missing
    if not user.get('email'):
        print("Email is missing. Setting it.")
        updates['email'] = target_email
        
    # Fix Company
    if user.get('company_id') != vallit_company['id']:
        print(f"Switching company from {user.get('company_id')} to {vallit_company['id']}")
        updates['company_id'] = vallit_company['id']
        
    # Fix Role
    if user.get('role') != 'superadmin':
        print(f"Updating role from {user.get('role')} to superadmin")
        updates['role'] = 'superadmin'
        
    if updates:
        print(f"Applying updates: {updates}")
        try:
            db.update_user(user['id'], updates)
            print("User updated successfully!")
            
            # Ensure member association
            try:
                # Check if member exists first to avoid error?
                # db.assign_user_to_company usually checks or upserts?
                # Let's inspect valid roles first. SUPERADMIN might fail if 'admin' is expected in checks.
                # db.py says: VALID_ROLES = ['admin', 'member', 'viewer'] usually.
                # If 'superadmin' is not in DB constraint it's fine.
                db.assign_user_to_company(user['id'], vallit_company['id'], role='admin') 
                print("User assigned to company members.")
            except Exception as e:
                print(f"Member assignment note: {e}")

        except Exception as e:
            print(f"Error updating user: {e}")
            
    else:
        print("User is already correctly configured.")

if __name__ == "__main__":
    fix_user()
