import db
import sys

def generate_key_for_theo():
    print("Generating API Key for user 'Theo'...")
    
    # 1. Find user
    user = db.get_user_by_name("Theo")
    if not user:
        print("Error: User 'Theo' not found.")
        return
    
    print(f"Found user: {user['name']} (ID: {user['id']})")
    
    # 2. Create Key
    try:
        key_record = db.create_api_key(user['id'], "iOS Shortcut")
        print("\n" + "="*50)
        print("SUCCESS! Here is your new API Key:")
        print("="*50)
        print(f"\n{key_record['key_value']}\n")
        print("="*50)
        print("Copy this key and paste it into your iOS Shortcut.")
        print("Header: Authorization")
        print(f"Value: Bearer {key_record['key_value']}")
        print("="*50)
    except Exception as e:
        print(f"Error generating key: {e}")

if __name__ == "__main__":
    if not db.is_db_configured():
        print("Error: Database not configured. Check .env file.")
        sys.exit(1)
    generate_key_for_theo()
