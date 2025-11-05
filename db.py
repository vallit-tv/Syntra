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
    except Exception as e:
        print(f"Error getting user by name '{name}': {e}")
        import traceback
        traceback.print_exc()
        return None


def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by ID"""
    try:
        result = get_db().table('users').select('*').eq('id', user_id).execute()
        return result.data[0] if result.data else None
    except:
        return None


def create_user(name: str, password_hash: str = None, is_password_set: bool = False, role: str = 'user') -> Dict:
    """Create new user (admin only)"""
    data = {
        'name': name,
        'password_hash': password_hash,
        'is_password_set': is_password_set,
        'created_at': datetime.utcnow().isoformat()
    }
    # Add role if provided (may not exist in database yet)
    if role:
        data['role'] = role
    
    try:
        result = get_db().table('users').insert(data).execute()
        print(f"Successfully created user: {name} with role: {role}")
        return result.data[0]
    except Exception as e:
        error_str = str(e).lower()
        print(f"Error creating user '{name}': {e}")
        # If role column doesn't exist, try without it
        if role and ('role' in error_str or 'column' in error_str):
            print(f"Retrying without role column...")
            data.pop('role', None)
            try:
                result = get_db().table('users').insert(data).execute()
                print(f"Successfully created user: {name} without role")
                return result.data[0]
            except Exception as e2:
                print(f"Error creating user without role: {e2}")
                raise
        # If user already exists, that's okay - return the existing user
        if 'duplicate' in error_str or 'unique' in error_str or 'already exists' in error_str:
            print(f"User '{name}' already exists, fetching...")
            existing = get_user_by_name(name)
            if existing:
                return existing
        raise


def update_user_role(user_id: str, role: str) -> bool:
    """Update user role"""
    try:
        get_db().table('users').update({
            'role': role
        }).eq('id', user_id).execute()
        return True
    except Exception as e:
        # If role column doesn't exist, return False (migration needed)
        if 'role' in str(e).lower() or 'column' in str(e).lower():
            return False
        return False

def update_user_password(user_id: str, password_hash: str) -> bool:
    """Update user password"""
    try:
        get_db().table('users').update({
            'password_hash': password_hash,
            'is_password_set': True
        }).eq('id', user_id).execute()
        return True
    except:
        return False


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

