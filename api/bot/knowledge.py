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
                      source_url: str = None, category: str = None, 
                      tags: List[str] = None, type: str = 'text',
                      metadata: Dict = None) -> Optional[Dict]:
        """
        Add a knowledge entry for a specific company with enhanced fields.
        """
        if not self.db:
            print("Database not connected")
            return None
            
        entry_data = {
            'company_id': company_id,
            'title': title,
            'content': content,
            'source_url': source_url,
            'category': category,
            'tags': tags or [],
            'type': type,
            'metadata': metadata or {},
            'is_active': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        try:
            # Check if entry with same title exists to update it (upsert-like behavior)
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

    def get_knowledge(self, company_id: str, limit: int = 20, 
                      category: str = None, tags: List[str] = None, 
                      query: str = None) -> List[Dict]:
        """
        Retrieve active knowledge entries for a company with optional filtering.
        """
        if not self.db:
            return []
            
        try:
            req = self.db.table('company_knowledge_base')\
                .select('*')\
                .eq('company_id', company_id)\
                .eq('is_active', True)
            
            if category:
                req = req.eq('category', category)
                
            if tags:
                # Assuming 'tags' column is text[] array in Postgres
                req = req.contains('tags', tags)
            
            if query:
                # Simple text search on title or content
                # Note: For better search, use full text search or embeddings
                req = req.ilike('title', f'%{query}%')

            result = req.order('created_at', desc=True)\
                .limit(limit)\
                .execute()
                
            return result.data or []
        except Exception as e:
            print(f"Error retrieving knowledge: {e}")
            return []

    def update_knowledge(self, entry_id: str, updates: Dict) -> Optional[Dict]:
        """
        Update specific fields of a knowledge entry.
        """
        if not self.db:
            return None
            
        try:
            updates['updated_at'] = datetime.utcnow().isoformat()
            result = self.db.table('company_knowledge_base').update(updates).eq('id', entry_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error updating knowledge: {e}")
            return None

    def delete_knowledge(self, entry_id: str, soft_delete: bool = True) -> bool:
        """
        Delete a knowledge entry (soft delete by default).
        """
        if not self.db:
            return False
            
        try:
            if soft_delete:
                self.db.table('company_knowledge_base').update({
                    'is_active': False,
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('id', entry_id).execute()
            else:
                self.db.table('company_knowledge_base').delete().eq('id', entry_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting knowledge: {e}")
            return False

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

    def get_categories(self, company_id: str) -> List[str]:
        """
        Get list of unique categories used by a company.
        """
        if not self.db:
            return []
            
        try:
            # Note: Supabase-py might not support 'distinct' easily in simple query builder without rpc 
            # We fetch distinct categories by getting all (limited) and processing python side for now
            # or use a raw sql function if available. 
            # For efficiency in large DBs, use an RPC call. 
            # Here we do a simple query as volume is expected to be managed.
            result = self.db.table('company_knowledge_base')\
                .select('category')\
                .eq('company_id', company_id)\
                .eq('is_active', True)\
                .execute()
                
            categories = set(item['category'] for item in result.data if item.get('category'))
            return list(sorted(categories))
        except Exception as e:
            print(f"Error getting categories: {e}")
            return []
