
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def deep_search():
    load_dotenv()
    client = db.get_db()
    
    term = "Kontaktformular"
    print(f"Searching DB for '{term}'...")
    
    # 1. Company Knowledge Base
    print("Checking 'company_knowledge_base'...")
    try:
        res = client.table('company_knowledge_base').select('*').ilike('content', f'%{term}%').execute()
        for row in res.data:
            print(f"FOUND in KB: {row['id']} - {row['title']}")
    except Exception as e:
        print(e)

    # 2. Companies (settings column is JSON, difficult to ilike, but we checked it already)
    # We can fetch all and check manually to be sure
    print("Checking 'companies' settings...")
    try:
        res = client.table('companies').select('*').execute()
        for row in res.data:
            if term in str(row.get('settings', '')):
                print(f"FOUND in Company Settings: {row['name']}")
    except:
        pass

    # 3. Chat Messages (in chat_sessions metadata)
    # This is expensive, but let's check recent ones
    print("Checking recent 'chat_sessions' messages...")
    try:
        res = client.table('chat_sessions').select('*').order('updated_at', desc=True).limit(50).execute()
        for row in res.data:
            meta = str(row.get('metadata', ''))
            if term in meta:
                print(f"FOUND in Session: {row['session_key']}")
                # print snippet
                start = meta.find(term)
                print(f"Snippet: {meta[start-50:start+50]}")
    except:
        pass

if __name__ == "__main__":
    deep_search()
