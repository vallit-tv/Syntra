import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:5000"  # Change to https://vallit.net for production test
ENDPOINT = "/api/wake"
URL = f"{BASE_URL}{ENDPOINT}"

# You need to paste your session cookie here
# Login to the app, open DevTools -> Application -> Cookies, copy 'syntra_session'
SESSION_COOKIE = "PASTE_YOUR_COOKIE_HERE" 

def test_wake():
    print(f"Testing {URL}...")
    
    headers = {
        "Content-Type": "application/json"
    }
    
    cookies = {
        "syntra_session": SESSION_COOKIE
    }
    
    payload = {
        "event": "awake"
    }
    
    try:
        response = requests.post(URL, json=payload, headers=headers, cookies=cookies)
        
        print(f"Status Code: {response.status_code}")
        print("Response Headers:")
        for k, v in response.headers.items():
            print(f"  {k}: {v}")
            
        print("\nResponse Body:")
        try:
            print(json.dumps(response.json(), indent=2))
        except:
            print(response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if SESSION_COOKIE == "PASTE_YOUR_COOKIE_HERE":
        print("Please update the SESSION_COOKIE variable in the script with your actual cookie.")
        sys.exit(1)
    test_wake()
