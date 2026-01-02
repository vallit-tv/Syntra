"""Knowledge Base Component - Manages company-specific knowledge"""
import uuid
from datetime import datetime
from typing import List, Dict, Optional

class KnowledgeBase:
    """
    Manages knowledge base entries for companies.
    Isolates knowledge by company_id.
    """
    
    def __init__(self, db_module):
        self.db = db_module.get_db()
        
    def add_knowledge(self, company_id: str, title: str, content: str, 
                      source_url: str = None, metadata: Dict = None) -> Optional[Dict]:
        """
        Add a knowledge entry for a specific company.
        """
        if not self.db:
            print("Database not connected")
            return None
            
        entry_data = {
            'company_id': company_id,
            'title': title,
            'content': content,
            'source_url': source_url,
            'metadata': metadata or {},
            'is_active': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        try:
            # Check if entry with same title exists to update it (upsert-like behavior for this script)
            # using title + company_id as unique key conceptually
            existing = self.db.table('company_knowledge_base').select('id').eq('company_id', company_id).eq('title', title).execute()
            
            if existing.data:
                # Update
                entry_id = existing.data[0]['id']
                del entry_data['created_at'] # Don't update created_at
                result = self.db.table('company_knowledge_base').update(entry_data).eq('id', entry_id).execute()
            else:
                # Insert
                result = self.db.table('company_knowledge_base').insert(entry_data).execute()
                
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error adding knowledge: {e}")
            return None

    def get_knowledge(self, company_id: str, limit: int = 20) -> List[Dict]:
        """
        Retrieve active knowledge entries for a company.
        """
        if not self.db:
            return []
            
        try:
            result = self.db.table('company_knowledge_base')\
                .select('*')\
                .eq('company_id', company_id)\
                .eq('is_active', True)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
                
            return result.data or []
        except Exception as e:
            print(f"Error retrieving knowledge: {e}")
            return []

    def clear_knowledge(self, company_id: str) -> bool:
        """
        Clear all knowledge for a company (useful for testing/resetting).
        """
        if not self.db:
            return False
            
        try:
            self.db.table('company_knowledge_base').delete().eq('company_id', company_id).execute()
            return True
        except Exception as e:
            print(f"Error clearing knowledge: {e}")
            return False
