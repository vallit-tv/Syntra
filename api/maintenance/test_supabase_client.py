#!/usr/bin/env python3
"""Test Supabase client initialization directly"""
import os
from dotenv import load_dotenv

load_dotenv()

print("Testing Supabase client initialization...")
print(f"SUPABASE_URL set: {bool(os.getenv('SUPABASE_URL'))}")
print(f"SUPABASE_SERVICE_KEY set: {bool(os.getenv('SUPABASE_SERVICE_KEY'))}")

try:
    from supabase import create_client
    print("\nImported create_client successfully")
    
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    print(f"\nAttempting to create client...")
    print(f"URL: {url[:30]}..." if url else "None")
    print(f"Key: {key[:30]}..." if key else "None")
    
    client = create_client(url, key)
    print("\n✅ SUCCESS! Client created successfully")
    print(f"Client type: {type(client)}")
    
    # Try a simple query
    print("\nTesting database query...")
    result = client.table('users').select('id').limit(1).execute()
    print(f"✅ Query successful! Found {len(result.data)} records")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
