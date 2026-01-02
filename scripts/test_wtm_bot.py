import sys
import os
import asyncio
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db, create_company, get_company_by_slug
from bot.knowledge import KnowledgeBase
from knowledge_scraper import SimpleScraper
from chat_service import get_chat_service

load_dotenv()

def setup_company():
    """Ensure WTM company exists"""
    print("\n1. Setting up Company...")
    slug = "wtm-consulting"
    company = get_company_by_slug(slug)
    
    if not company:
        print(f"Company {slug} not found, creating...")
        try:
            company = create_company("WTM Consulting", slug, {
                "website": "https://wtm-consulting.vercel.app"
            })
            print(f"Created company: {company['id']}")
        except Exception as e:
            print(f"Error creating company: {e}")
            return None
    else:
        print(f"Found existing company: {company['id']}")
        
    return company

def ingest_data(company_id):
    """Scrape and ingest data"""
    print("\n2. Ingesting Data...")
    scraper = SimpleScraper()
    kb = KnowledgeBase(sys.modules['db']) # pass db module shim or ensure KnowledgeBase imports get_db directly
    
    # We need to fix KnowledgeBase import in the previous step if it expected a module instance
    # Actually KnowledgeBase implementation I wrote imports db_module but expects it passed in __init__
    # Let's check how I wrote KnowledgeBase. 
    # __init__(self, db_module) -> self.db = db_module.get_db()
    # So I can pass a dummy class or just the db module itself since it has get_db
    import db
    kb = KnowledgeBase(db)
    
    url = "https://wtm-consulting.vercel.app"
    print(f"Scraping {url}...")
    
    results = scraper.scrape_url(url, max_pages=3, max_depth=1)
    
    if not results:
        print("No data scraped!")
        return
        
    print(f"Found {len(results)} pages. Ingesting...")
    
    # Clear old knowledge for clean test
    kb.clear_knowledge(company_id)
    
    for page in results:
        print(f" - Adding: {page['title']}")
        kb.add_knowledge(
            company_id=company_id,
            title=page['title'],
            content=page['content'],
            source_url=page['url']
        )
        
    print("Ingestion complete.")

def test_chat(company_id):
    """Run chat loop"""
    print("\n3. Starting Chat Session...")
    chat_service = get_chat_service()
    
    # Create a session
    import db
    session, created = chat_service.get_or_create_session(
        db, 
        session_key=f"test_session_{company_id[:8]}",
        company_id=company_id
    )
    
    if not session:
        print("Failed to create session")
        return

    print("\n" + "="*50)
    print("🤖 WTM Bot is ready! (Type 'quit' to exit)")
    print("="*50 + "\n")
    
    # Pre-inject system prompt with knowledge (Manual simulation of what the engine should do)
    # The current chat_service.get_company_knowledge does this.
    # Let's verify chat_service uses the knowledge base.
    # Looking at chat_service.py: 
    # def get_company_knowledge(self, db_module, company_id) -> reads from 'company_knowledge_base'
    # So it SHOULD work automatically if I just call generate_response with the right system prompt construction.
    
    # But wait, chat_service.generate_response doesn't automatically fetch knowledge.
    # The caller usually constructs the system prompt.
    # In a real widget, the backend route handler does this.
    # So we must simulate the route handler here.
    
    knowledge_text = chat_service.get_company_knowledge(db, company_id)
    base_system_prompt = chat_service.default_system_prompt
    
    full_system_prompt = f"""{base_system_prompt}

You are the AI assistant for WTM Consulting. 
Use the following context to answer user questions. 
If the answer is not in the context, politely say you don't know but offer to contact support.

CONTEXT:
{knowledge_text}
"""
    
    messages = []
    
    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit']:
                break
                
            messages.append({'role': 'user', 'content': user_input})
            
            print("Bot: ...", end='\r')
            
            response, meta = chat_service.generate_response(
                messages=messages,
                system_prompt=full_system_prompt,
                db_module=db,
                company_id=company_id
            )
            
            if response:
                print(f"Bot: {response}")
                messages.append({'role': 'assistant', 'content': response})
            else:
                print("Bot: [Error generating response]")
                if meta:
                    print(f"Debug: {meta}")
                    
        except KeyboardInterrupt:
            break
            
    print("\nBye!")

def main():
    company = setup_company()
    if company:
        # Ask user if they want to re-ingest
        # For automation, we just do it.
        ingest_data(company['id'])
        test_chat(company['id'])

if __name__ == "__main__":
    main()
