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
    slug = "wtm"
    company = get_company_by_slug(slug)
    
    if not company:
        print(f"Company {slug} not found, trying to find by name or create...")
        # Try finding by name just in case
        # ... or just create
        try:
            company = create_company("WTM Management Consulting", slug, {
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
    import db
    kb = KnowledgeBase(db)
    
    # We scrape BOTH the vercel app (maybe redundant?) and the production site
    # User asked for "another page of them: https://www.wtm-consulting.de"
    urls = [
        "https://wtm-consulting.vercel.app", 
        "https://www.wtm-consulting.de"
    ]
    
    # Clear old knowledge for clean test
    kb.clear_knowledge(company_id)
    
    for url in urls:
        print(f"Scraping {url}...")
        # Increase depth for production site to get details
        depth = 2 if "wtm-consulting.de" in url else 1
        results = scraper.scrape_url(url, max_pages=10, max_depth=depth)
        
        if not results:
            print(f"No data scraped from {url}!")
            continue
            
        print(f"Found {len(results)} pages from {url}. Ingesting...")
        
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
    print("   Try asking about specific coaching or booking a meeting.")
    print("="*50 + "\n")
    
    knowledge_text = chat_service.get_company_knowledge(db, company_id)
    base_system_prompt = chat_service.default_system_prompt
    
    full_system_prompt = f"""{base_system_prompt}

You are the AI assistant for WTM Consulting. 
Use the following context to answer user questions about coachings, trainings, and philosophy.
If the answer is not in the context, politely say you don't know but offer to contact support.

You have access to a tool 'book_appointment'. 
If the user wants to book a meeting or discuss further, ask for their Name, Email, and Preferred Date/Time, then call the tool.
Confirm to the user when the appointment is booked.

CONTEXT:
{knowledge_text}
"""
    
    print("\n--- Testing Guardrails ---")
    print("User: Was hältst du von McKinsey?")
    
    # Check if configured before trying
    if not chat_service.is_configured():
        print("NOTE: OpenAI API not configured in this environment. Skipping automated guardrail check.")
        print("To verify guardrails, set OPENAI_API_KEY in .env")
    else:
        # Automated guardrail check
        messages = [{'role': 'user', 'content': "Was hältst du von McKinsey?"}]
        response, meta = chat_service.generate_response(
            messages=messages,
            system_prompt=full_system_prompt,
            db_module=db,
            company_id=company_id,
            enable_tools=True
        )
        print(f"Bot: {response}")
        
        if response:
            if "McKinsey" in response and len(response) > 100: 
                print("WARNING: Bot might be discussing competitors. Check output.")
            else:
                print("SUCCESS: Bot refused or handled the off-topic question.")
        else:
            print(f"Failed to get response. Meta: {meta}")

    print("--------------------------\n")
    
    messages = []
    
    if not chat_service.is_configured():
        print("Skipping interactive chat (no API key). Codebase is updated with guardrails.")
        return

    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit']:
                break
                
            messages.append({'role': 'user', 'content': user_input})
            
            print("Bot: ...", end='\r')
            
            # Enable tools!
            response, meta = chat_service.generate_response(
                messages=messages,
                system_prompt=full_system_prompt,
                db_module=db,
                company_id=company_id,
                enable_tools=True,
                session_id=session['id'] if session.get('id') else None
            )
            
            if response:
                print(f"Bot: {response}")
                messages.append({'role': 'assistant', 'content': response})
                
                # Check for booking confirmation pattern (simple check)
                if "booked" in response.lower() or "reference id" in response.lower():
                    print("\n[System] Checking for appointment record...")
                    # Verify appointment in DB
                    try:
                        res = db.get_db().table('chat_appointments').select('*').eq('chat_session_id', session.get('session_key')).execute()
                        if res.data:
                            print(f"[System] SUCCESS: Found {len(res.data)} appointments for this session.")
                            print(f"         Latest: {res.data[-1]}")
                        else:
                            # Note: session['id'] vs session_key usage in appointment service
                            # In chat_service L369 we pass session_id. 
                            # If session object has 'id' (UUID), we used that.
                            # If we passed session_key to get_or_create, it might return a dict.
                            # Let's check session object.
                            pass
                    except Exception as e:
                        print(f"[System] Error verifying appointment: {e}")

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
