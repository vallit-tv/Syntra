"""All database operations - Supabase"""
import os
import hashlib
import secrets
from datetime import datetime
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase connection
def get_db() -> Client:
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')
    if not url or not key:
        raise RuntimeError('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env')
    return create_client(url, key)


# ============================================================================
# USER OPERATIONS
# ============================================================================

def get_user_by_name(name: str) -> Optional[Dict]:
    """Get user by name"""
    try:
        result = get_db().table('users').select('*').eq('name', name).execute()
        return result.data[0] if result.data else None
    except:
        return None


def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by ID"""
    try:
        result = get_db().table('users').select('*').eq('id', user_id).execute()
        return result.data[0] if result.data else None
    except:
        return None


def create_user(name: str, token_hash: str) -> Dict:
    """Create new user"""
    data = {
        'name': name,
        'token_hash': token_hash,
        'created_at': datetime.utcnow().isoformat()
    }
    result = get_db().table('users').insert(data).execute()
    return result.data[0]


def hash_token(token: str) -> str:
    """Hash token for storage"""
    return hashlib.sha256(token.encode()).hexdigest()


# ============================================================================
# API KEYS OPERATIONS
# ============================================================================

def get_api_keys(user_id: str) -> List[Dict]:
    """Get user's API keys"""
    try:
        result = get_db().table('api_keys').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        return result.data or []
    except:
        return []


def create_api_key(user_id: str, data: Dict) -> Dict:
    """Create new API key"""
    key_data = {
        'user_id': user_id,
        'name': data['name'],
        'type': data['type'],
        'key_value': data['key_value'],
        'is_active': True,
        'created_at': datetime.utcnow().isoformat()
    }
    result = get_db().table('api_keys').insert(key_data).execute()
    return result.data[0]


def delete_api_key(key_id: str, user_id: str) -> bool:
    """Delete API key"""
    try:
        get_db().table('api_keys').delete().eq('id', key_id).eq('user_id', user_id).execute()
        return True
    except:
        return False

