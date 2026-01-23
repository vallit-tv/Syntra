
import os
import sys
from typing import Optional, Dict, List

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from db import get_db
from bot.knowledge import KnowledgeBase

load_dotenv()

def populate_wtm_knowledge():
    db = get_db()
    if not db:
        print("Failed to connect to database")
        return

    kb = KnowledgeBase(sys.modules[__name__]) 
    # Mocking db_module with get_db in current scope or just pass a simple obj
    # Actually KnowledgeBase expects a module with get_db. 
    # Let's just patch it or instantiate it carefully.
    
    class DBModule:
        @staticmethod
        def get_db():
            return db
            
    kb = KnowledgeBase(DBModule)

    # 1. Find Company
    print("Finding WTM Consulting company...")
    try:
        # Try to find by name "WTM" or "wtm-consulting" or similar
        response = db.table('companies').select('*').ilike('name', '%wtm%').execute()
        company = None
        if response.data:
            company = response.data[0]
            print(f"Found company: {company['name']} ({company['id']})")
        else:
            # Fallback for dev: Use the first company or create one?
            # User said "add data for the company wtm-consulting".
            # If not found, let's list all companies
            all_companies = db.table('companies').select('*').limit(5).execute()
            if all_companies.data:
                company = all_companies.data[0]
                print(f"WTM not found. Using first available company: {company['name']} ({company['id']})")
            else:
                print("No companies found in DB.")
                return

    except Exception as e:
        print(f"Error finding company: {e}")
        return

    company_id = company['id']

    # 2. Prepare Data
    knowledge_entries = [
        {
            "title": "What is WTM Management Consulting?",
            "content": "WTM Management Consulting GmbH is a professional consulting firm based in Dortmund (Neuer Graben 61). Led by Dr. Till Reichert and Malte Werner, the firm specializes in high-quality coaching, training, and organizational consulting. Their philosophy is 'Selbstkompetenz erzeugt Haltung' (Self-competence creates attitude), prioritizing a human-centric approach that fosters respect, curiosity, responsibility, and humor over rigid, standardized programs.",
            "category": "General",
            "type": "text",
            "tags": ["about", "philosophy", "location", "founders"]
        },
        {
            "title": "What services does WTM offer for individuals?",
            "content": "For individuals, WTM offers:\n- **Coaching:** Focused on developing potential, performance optimization, and crisis management.\n- **Shadowing:** Direct accompaniment and participatory observation to provide feedback.\n- **Supervision:** Reflective analysis of work situations from a 'bird's eye view'.\n- **Mediation & Clarification:** Assistance in resolving stuck negotiations and conflicts.",
            "category": "Services",
            "type": "text",
            "tags": ["coaching", "individuals", "mediation", "supervision"]
        },
        {
            "title": "What services does WTM offer for teams?",
            "content": "For teams, WTM provides:\n- **Team Development:** Measures to strengthen cooperation, clarify roles, and address group dynamics.\n- **Workshops:** Facilitated sessions for creative and systemic problem-solving.\n- **Moderation:** Neutral facilitation for difficult discussions or planning sessions.\n- **Seminars & E-Learnings:** Various training formats for specific skill building.",
            "category": "Services",
            "type": "text",
            "tags": ["teams", "workshops", "moderation", "development"]
        },
        {
            "title": "What services does WTM offer for organizations?",
            "content": "For organizations, WTM facilitates large-scale interventions including:\n- **Large Group Events:** Formats like World Café, Open Space, Future Conferences, and RTSC (Real Time Strategic Change).\n- **Organizational Constellations:** Using spatial mapping techniques to visualize and solve complex structural or motivational issues.",
            "category": "Services",
            "type": "text",
            "tags": ["organizations", "large-group", "constellations", "strategy"]
        },
        {
            "title": "Does WTM offer training for coaches or consultants?",
            "content": "Yes, WTM offers a comprehensive **Coach/Consultant Training (Ausbildung)**. This certification program consists of 6 modules covering:\n1. Biography & Identity\n2. Systemic Schools (NLP, Transactional Analysis, TZI)\n3. Methodology\n4. Practical Application\n5. Moderation\n6. Final Certification\n\nThe training relies on distinct methodologies rather than arbitrary tools.",
            "category": "Training",
            "type": "text",
            "tags": ["training", "certification", "coaching-education"]
        },
        {
            "title": "What methodologies does WTM use?",
            "content": "WTM rejects standardized 'PowerPoint solutions' in favor of flexible, context-specific interventions. Their methodological toolkit includes:\n- **Systemic Consulting**\n- **Psychodrama** and **Group Dynamics**\n- **Gestalt Therapy** approaches\n- **Neuro-Linguistic Programming (NLP)**\n- **Transactional Analysis (TA)**\n- **Theme-Centered Interaction (TZI)**\n- Communication models (e.g., Schulz von Thun)\n- Strategic tools (SWOT, Balanced Scorecard)",
            "category": "Methodology",
            "type": "text",
            "tags": ["methods", "systemic", "psychology", "nlp", "ta"]
        },
        {
            "title": "How can I contact WTM Management Consulting?",
            "content": "You can contact WTM Management Consulting at:\n\n**Address:** Neuer Graben 61, 44139 Dortmund\n**Phone:** 0231 137 22 666\n**Email:** info@wtm-consulting.de",
            "category": "General",
            "type": "faq",
            "tags": ["contact", "address", "phone", "email"]
        },
        {
            "title": "What is WTM's core philosophy?",
            "content": "WTM's core philosophy is **'Selbstkompetenz erzeugt Haltung'** (Self-competence creates attitude). They believe that true professional development comes from strengthening an individual's self-awareness and inner stance (\"Haltung\"), rather than just learning superficial techniques. They emphasize vibrant professionalism, personal atmosphere, and meeting clients at eye level.",
            "category": "Philosophy",
            "type": "text",
            "tags": ["values", "philosophy", "motto"]
        }
    ]

    # 3. Insert Data
    print(f"\nPopulating knowledge for company ID: {company_id}...")
    
    count = 0
    for entry in knowledge_entries:
        try:
            result = kb.add_knowledge(
                company_id=company_id,
                title=entry['title'],
                content=entry['content'],
                category=entry['category'],
                tags=entry['tags'],
                type=entry['type'],
                source_url="https://www.wtm-consulting.de"
            )
            if result:
                print(f"Added: {entry['title']}")
                count += 1
            else:
                print(f"Failed to add: {entry['title']}")
        except Exception as e:
            print(f"Error adding {entry['title']}: {e}")

    print(f"\nSuccessfully populated {count} knowledge entries.")

if __name__ == "__main__":
    populate_wtm_knowledge()
