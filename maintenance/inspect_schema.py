import os
from supabase import create_client

url = "https://nlbmhxrcxxeyjwfjxklj.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYm1oeHJjeHhleWp3Zmp4a2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE2NzU0MywiZXhwIjoyMDc3NzQzNTQzfQ.8RQt3D0xwUf-7YrGoR1RPsDWd0XcJN096Imj7tAacBA"

print(f"Connecting to {url}...")

# Proxy workaround
proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
saved_proxies = {}
for var in proxy_vars:
    if var in os.environ:
        saved_proxies[var] = os.environ[var]
        del os.environ[var]

try:
    try:
        supabase = create_client(url, key)
    except Exception:
        supabase = create_client(supabase_url=url, supabase_key=key)
        
    print("Client created.")
    
    # Check users table
    print("Querying users table...")
    response = supabase.table('users').select('*').limit(1).execute()
    print("Users query success.")
    if response.data:
        print("Users columns:", list(response.data[0].keys()))
    else:
        print("Users table exists but is empty.")
        
    # Check if conversations table exists
    print("Querying conversations table...")
    try:
        response = supabase.table('conversations').select('*').limit(1).execute()
        print("Conversations table exists.")
    except Exception as e:
        print(f"Conversations table query failed (expected if not created): {e}")

except Exception as e:
    print(f"Error: {e}")
finally:
    # Restore proxies
    for var, val in saved_proxies.items():
        os.environ[var] = val
