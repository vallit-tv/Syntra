import requests
import os

url = "https://nlbmhxrcxxeyjwfjxklj.supabase.co/rest/v1/users?select=*&limit=1"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYm1oeHJjeHhleWp3Zmp4a2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE2NzU0MywiZXhwIjoyMDc3NzQzNTQzfQ.8RQt3D0xwUf-7YrGoR1RPsDWd0XcJN096Imj7tAacBA"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

# Proxy workaround
proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
saved_proxies = {}
for var in proxy_vars:
    if var in os.environ:
        saved_proxies[var] = os.environ[var]
        del os.environ[var]

print(f"Querying {url}...")
try:
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data:
            print("Users columns:", list(data[0].keys()))
        else:
            print("Users table exists but is empty.")
    else:
        print(f"Error body: {response.text}")
        
    # Check ai_advice_history user_id
    advice_url = "https://nlbmhxrcxxeyjwfjxklj.supabase.co/rest/v1/ai_advice_history?select=user_id&limit=1"
    print(f"Querying {advice_url}...")
    response = requests.get(advice_url, headers=headers)
    print(f"Advice user_id Status: {response.status_code}")
    if response.status_code != 200:
        print(f"Advice user_id Error: {response.text}")

    # Check integrations user_id
    int_url = "https://nlbmhxrcxxeyjwfjxklj.supabase.co/rest/v1/integrations?select=user_id&limit=1"
    print(f"Querying {int_url}...")
    response = requests.get(int_url, headers=headers)
    print(f"Integrations user_id Status: {response.status_code}")
    if response.status_code != 200:
        print(f"Integrations user_id Error: {response.text}")

except Exception as e:
    print(f"Error: {e}")
finally:
    for var, val in saved_proxies.items():
        os.environ[var] = val
