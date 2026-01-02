
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_KEY')
client = create_client(url, key)

print("Checking widget_configs for 'demo'...")
try:
    res = client.table('widget_configs').select('*').eq('widget_id', 'demo').execute()
    if res.data:
        print("Found demo config:", res.data[0])
    else:
        print("No demo config found.")
        
    print("\nChecking companies with webhook_url...")
    res = client.table('companies').select('id, name, webhook_url').not_.is_('webhook_url', 'null').execute()
    if res.data:
        print("Found companies with webhooks:", res.data)
    else:
        print("No companies with webhooks found.")

except Exception as e:
    print(f"Error: {e}")
