#!/usr/bin/env python3
"""Script to create a user account via API or direct database access"""
import os
import sys
import requests

def create_user_via_api(name: str, base_url: str = None, role: str = 'user'):
    """Create user via API endpoint with role"""
    if not base_url:
        base_url = os.getenv('API_BASE_URL', 'http://localhost:5000')
    
    url = f"{base_url}/api/admin/create-user"
    payload = {"name": name, "role": role}
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get('user')
        else:
            error = response.json().get('error', 'Unknown error')
            raise ValueError(f"API error: {error}")
    except requests.exceptions.RequestException as e:
        raise ConnectionError(f"Failed to connect to API at {url}: {e}")

def create_user_direct(name: str, role: str = 'user'):
    """Create user directly via database"""
    import auth
    return auth.create_user_admin(name, role=role)

def main():
    name = "Theo"
    role = "ceo"  # Make Theo CEO/Admin
    base_url = os.getenv('API_BASE_URL')
    
    # Try API first (if base_url is provided or for deployed environments)
    if base_url or os.getenv('VERCEL') or os.getenv('VERCEL_URL'):
        if not base_url:
            # Try to construct from Vercel environment
            vercel_url = os.getenv('VERCEL_URL')
            if vercel_url:
                base_url = f"https://{vercel_url}"
            else:
                print("Error: API_BASE_URL not set and VERCEL_URL not available")
                print("Please set API_BASE_URL environment variable with your deployment URL")
                print("Example: export API_BASE_URL=https://your-app.vercel.app")
                sys.exit(1)
        
        print(f"Creating user via API at {base_url}...")
        try:
            user = create_user_via_api(name, base_url, role)
            print(f"✓ User '{name}' created/updated successfully!")
            print(f"  User ID: {user['id']}")
            print(f"  Name: {user['name']}")
            print(f"  Role: {user.get('role', role)}")
        except Exception as e:
            print(f"✗ Error creating user via API: {e}")
            sys.exit(1)
    else:
        # Try direct database access
        print("Creating user via direct database access...")
        try:
            user = create_user_direct(name, role)
            print(f"✓ User '{name}' created/updated successfully!")
            print(f"  User ID: {user['id']}")
            print(f"  Name: {user['name']}")
            print(f"  Role: {user.get('role', role)}")
        except Exception as e:
            print(f"✗ Error creating user directly: {e}")
            print("\nTrying via API instead...")
            print("If you have a deployed URL, set API_BASE_URL environment variable")
            print("Example: API_BASE_URL=https://your-app.vercel.app python3 create_user.py")
            sys.exit(1)
    
    print(f"\nThe user can now set their password by:")
    print(f"  1. Going to the login page")
    print(f"  2. Typing '{name}' as the username")
    print(f"  3. They will be prompted to set their password")

if __name__ == "__main__":
    main()

