
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('.env')

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: Config missing")
    exit(1)

supabase = create_client(url, key)

def migrate_specific_user(email, name, role='admin'):
    print(f"Migrating {name} -> {email}...")
    try:
        # Check if user exists by trying to create
        # If exists, we might want to update metadata or just confirm
        res = supabase.auth.admin.create_user({
            "email": email,
            "email_confirm": True,
            "user_metadata": { "name": name, "role": role }
        })
        print(f"  Success: Created {res.user.id}")
        
        # Invite user via email so they can set password? 
        # User requested "first time create own strong password", which matches the Reset Password flow nicely.
        # We don't need to trigger invite here explicitly if we rely on them clicking "First time?" on login page.
        # However, sending an Invite via API generates a link we can give them, or sends an email if configured.
        # Let's just ensure the account exists so the "Reset Password" flow works.
        
    except Exception as e:
        if "already registered" in str(e) or "already exists" in str(e):
            print(f"  User {email} already exists.")
            # Optional: Update metadata to ensure role is set
            # We'd need the ID to update, which we can't easily get without admin.list_users() or similar if create fails.
            # But for now, assuming it's fine.
        else:
            print(f"  Error: {e}")

if __name__ == "__main__":
    migrate_specific_user('theorei@icloud.com', 'Theo', 'admin')
