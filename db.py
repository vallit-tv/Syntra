"""All database operations - Supabase"""
import os
import hashlib
import secrets
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Cached database client instance
_db_client: Optional[Client] = None
_db_error: Optional[str] = None

def is_db_configured() -> bool:
    """Check if database environment variables are set"""
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')
    
    # Debug logging in Vercel to help diagnose issues
    if not url or not key:
        missing = []
        if not url:
            missing.append('SUPABASE_URL')
        if not key:
            if not os.getenv('SUPABASE_SERVICE_KEY'):
                missing.append('SUPABASE_SERVICE_KEY')
            if not os.getenv('SUPABASE_KEY'):
                missing.append('SUPABASE_KEY (or SUPABASE_SERVICE_KEY)')
        print(f"Database configuration check: Missing variables: {', '.join(missing) if missing else 'None'}")
        print(f"  SUPABASE_URL set: {bool(url)}")
        print(f"  SUPABASE_KEY set: {bool(os.getenv('SUPABASE_KEY'))}")
        print(f"  SUPABASE_SERVICE_KEY set: {bool(os.getenv('SUPABASE_SERVICE_KEY'))}")
        print(f"  VERCEL env: {os.getenv('VERCEL')}")
        print(f"  All env vars (SUPABASE*): {[k for k in os.environ.keys() if 'SUPABASE' in k]}")
    
    return bool(url and key)

def test_db_connection() -> Tuple[bool, Optional[str]]:
    """
    Test database connection.
    Returns (connected: bool, error_message: Optional[str])
    """
    if not is_db_configured():
        return False, "Database not configured: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
    
    try:
        client = get_db()
        if client is None:
            return False, "Failed to create database client. Check your SUPABASE_URL and SUPABASE_SERVICE_KEY."
        # Try a simple query to test connection (wrap in try-except to handle any query errors)
        try:
            client.table('users').select('id').limit(1).execute()
            return True, None
        except Exception as query_error:
            # Connection might be established but query failed (e.g., table doesn't exist)
            # This is still considered a connection success for health checks
            error_msg = str(query_error)
            if 'relation' in error_msg.lower() and 'does not exist' in error_msg.lower():
                # Table doesn't exist - connection works but schema not set up
                return True, "Database connected but tables may not be initialized"
            return False, f"Connection test query failed: {error_msg}"
    except Exception as e:
        error_msg = str(e)
        print(f"Database connection test failed: {error_msg}")
        return False, f"Connection failed: {error_msg}"

# Supabase connection
def get_db() -> Optional[Client]:
    """
    Get Supabase database client.
    Returns None if database is not configured or connection fails.
    """
    global _db_client, _db_error
    
    # Return cached client if available
    if _db_client is not None:
        return _db_client
    
    # Check if we've already failed
    if _db_error:
        print(f"Database client not available: {_db_error}")
        return None
    
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')
    
    if not url or not key:
        _db_error = "Database not configured: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
        print(f"Warning: {_db_error}")
        return None
    
    # Create client - handle proxy-related issues
    # The proxy error might come from Vercel environment or httpx library
    # Temporarily unset proxy env vars if they exist
    proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
    saved_proxies = {}
    
    for var in proxy_vars:
        if var in os.environ:
            saved_proxies[var] = os.environ[var]
            del os.environ[var]
    
    try:
        # Try simple positional arguments
        client = create_client(url, key)
        _db_client = client
        print("Database client created successfully")
        return client
    except Exception as e:
        error_msg = str(e).lower()
        print(f"Error creating Supabase client: {e}")
        
        # If it's a proxy error, try keyword args
        if 'proxy' in error_msg or 'unexpected keyword' in error_msg:
            try:
                print("Retrying with keyword arguments...")
                client = create_client(supabase_url=url, supabase_key=key)
                _db_client = client
                print("Database client created successfully with keyword arguments")
                return client
            except Exception as e2:
                _db_error = f"Supabase client initialization failed: {e2}"
                print(f"Error with keyword args: {e2}")
        else:
            _db_error = f"Failed to create Supabase client: {e}"
        
        # Don't raise - return None so the app can continue
        print(f"Warning: {_db_error}")
        return None
    finally:
        # Restore proxy env vars
        for var, value in saved_proxies.items():
            os.environ[var] = value


# ============================================================================
# USER OPERATIONS
# ============================================================================

def get_user_by_name(name: str) -> Optional[Dict]:
    """Get user by name"""
    try:
        db_client = get_db()
        if db_client is None:
            print(f"Database not available, cannot get user by name '{name}'")
            return None
        result = db_client.table('users').select('*').eq('name', name).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error getting user by name '{name}': {e}")
        import traceback
        traceback.print_exc()
        return None


def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by ID"""
    try:
        db_client = get_db()
        if db_client is None:
            return None
        result = db_client.table('users').select('*').eq('id', user_id).execute()
        return result.data[0] if result.data else None
    except:
        return None

def get_all_users() -> List[Dict]:
    """Get all users (admin only)"""
    try:
        db_client = get_db()
        if db_client is None:
            return []
        result = db_client.table('users').select('*').order('created_at', desc=True).execute()
        return result.data or []
    except:
        return []


def create_user(
    name: str,
    password_hash: str = None,
    is_password_set: bool = False,
    role: str = 'user',
    company_id: str = None
) -> Dict:
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
    if company_id:
        data['company_id'] = company_id
    
    try:
        db_client = get_db()
        if db_client is None:
            raise RuntimeError("Database not available. Please check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.")
        result = db_client.table('users').insert(data).execute()
        created_user = result.data[0]
        print(f"Successfully created user: {name} with role: {role}")
        if company_id and not created_user.get('company_id'):
            try:
                assign_user_to_company(created_user['id'], company_id)
                created_user = get_user_by_id(created_user['id']) or created_user
            except Exception as assign_error:
                print(f"Warning: failed to assign company during user create: {assign_error}")
        return created_user
    except Exception as e:
        error_str = str(e).lower()
        print(f"Error creating user '{name}': {e}")
        # If role column doesn't exist, try without it
        if role and ('role' in error_str or 'column' in error_str):
            print(f"Retrying without role column...")
            data.pop('role', None)
            company_value = data.pop('company_id', None) if 'company_id' in data else None
            try:
                db_client = get_db()
                if db_client is None:
                    raise RuntimeError("Database not available. Please check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.")
                result = db_client.table('users').insert(data).execute()
                print(f"Successfully created user: {name} without role")
                created_user = result.data[0]
                if company_value:
                    try:
                        assign_user_to_company(created_user['id'], company_value)
                        created_user = get_user_by_id(created_user['id']) or created_user
                    except Exception as assign_error:
                        print(f"Warning: failed to assign company during user create: {assign_error}")
                return created_user
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
        db_client = get_db()
        if db_client is None:
            return False
        db_client.table('users').update({
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
        db_client = get_db()
        if db_client is None:
            return False
        db_client.table('users').update({
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

# ============================================================================
# INTEGRATIONS OPERATIONS
# ============================================================================

def get_integration(user_id: str, service_type: str) -> Optional[Dict]:
    """Get user's integration for a specific service"""
    try:
        result = get_db().table('integrations').select('*').eq('user_id', user_id).eq('service_type', service_type).execute()
        return result.data[0] if result.data else None
    except:
        return None

def get_all_integrations(user_id: str) -> List[Dict]:
    """Get all user's integrations"""
    try:
        result = get_db().table('integrations').select('*').eq('user_id', user_id).execute()
        return result.data or []
    except:
        return []

def create_or_update_integration(user_id: str, service_type: str, service_url: str = None, api_key: str = None, config: Dict = None) -> Dict:
    """Create or update integration"""
    integration_data = {
        'user_id': user_id,
        'service_type': service_type,
        'is_active': True,
        'last_connected_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    if service_url:
        integration_data['service_url'] = service_url
    if api_key:
        integration_data['api_key'] = api_key
    if config:
        integration_data['config'] = config
    
    try:
        # Try to update existing
        existing = get_integration(user_id, service_type)
        if existing:
            result = get_db().table('integrations').update(integration_data).eq('id', existing['id']).execute()
            return result.data[0] if result.data else existing
        
        # Create new
        integration_data['created_at'] = datetime.utcnow().isoformat()
        result = get_db().table('integrations').insert(integration_data).execute()
        return result.data[0]
    except Exception as e:
        print(f"Error creating/updating integration: {e}")
        raise

def delete_integration(user_id: str, service_type: str) -> bool:
    """Delete integration"""
    try:
        get_db().table('integrations').delete().eq('user_id', user_id).eq('service_type', service_type).execute()
        return True
    except:
        return False

# ============================================================================
# WORKFLOW OPERATIONS
# ============================================================================

def get_workflows(public_only: bool = False) -> List[Dict]:
    """Get workflows (admin sees all, users see public)"""
    try:
        query = get_db().table('workflows').select('*')
        if public_only:
            query = query.eq('is_public', True).eq('is_active', True)
        result = query.order('created_at', desc=True).execute()
        return result.data or []
    except:
        return []

def get_all_workflows() -> List[Dict]:
    """Get all workflows regardless of public/active status (for sync)"""
    try:
        result = get_db().table('workflows').select('*').order('created_at', desc=True).execute()
        return result.data or []
    except:
        return []

def create_workflow(workflow_data: Dict) -> Dict:
    """Create a new workflow"""
    try:
        workflow_insert = {
            'n8n_workflow_id': workflow_data.get('n8n_workflow_id'),
            'name': workflow_data.get('name', ''),
            'description': workflow_data.get('description'),
            'category': workflow_data.get('category'),
            'required_services': workflow_data.get('required_services', []),
            'metadata': workflow_data.get('metadata', {}),
            'is_active': workflow_data.get('is_active', True),
            'is_public': workflow_data.get('is_public', False),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        if 'created_by' in workflow_data:
            workflow_insert['created_by'] = workflow_data['created_by']
        result = get_db().table('workflows').insert(workflow_insert).execute()
        return result.data[0]
    except Exception as e:
        print(f"Error creating workflow: {e}")
        raise

def get_workflow_by_id(workflow_id: str) -> Optional[Dict]:
    """Get workflow by ID"""
    try:
        result = get_db().table('workflows').select('*').eq('id', workflow_id).execute()
        return result.data[0] if result.data else None
    except:
        return None

def get_workflow_by_n8n_id(n8n_workflow_id: int) -> Optional[Dict]:
    """Get workflow by n8n workflow ID"""
    try:
        result = get_db().table('workflows').select('*').eq('n8n_workflow_id', n8n_workflow_id).execute()
        return result.data[0] if result.data else None
    except:
        return None

def create_or_update_workflow(workflow_data: Dict) -> Dict:
    """Create or update workflow (sync from n8n)"""
    n8n_workflow_id = workflow_data.get('n8n_workflow_id')
    if not n8n_workflow_id:
        raise ValueError("n8n_workflow_id is required")
    
    # Check if workflow exists
    existing = get_workflow_by_n8n_id(n8n_workflow_id)
    
    workflow_update = {
        'n8n_workflow_id': n8n_workflow_id,
        'name': workflow_data.get('name', ''),
        'description': workflow_data.get('description'),
        'category': workflow_data.get('category'),
        'metadata': workflow_data.get('metadata', {}),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    # Only update these if explicitly provided
    if 'required_services' in workflow_data:
        workflow_update['required_services'] = workflow_data['required_services']
    if 'config_schema' in workflow_data:
        workflow_update['config_schema'] = workflow_data['config_schema']
    if 'created_by' in workflow_data:
        workflow_update['created_by'] = workflow_data['created_by']
    
    try:
        if existing:
            # Update existing
            result = get_db().table('workflows').update(workflow_update).eq('id', existing['id']).execute()
            return result.data[0] if result.data else existing
        else:
            # Create new
            workflow_update['created_at'] = datetime.utcnow().isoformat()
            workflow_update['is_active'] = workflow_data.get('is_active', True)
            workflow_update['is_public'] = workflow_data.get('is_public', False)
            result = get_db().table('workflows').insert(workflow_update).execute()
            return result.data[0]
    except Exception as e:
        print(f"Error creating/updating workflow: {e}")
        raise

def update_workflow(workflow_id: str, updates: Dict) -> bool:
    """Update workflow properties"""
    try:
        updates['updated_at'] = datetime.utcnow().isoformat()
        get_db().table('workflows').update(updates).eq('id', workflow_id).execute()
        return True
    except:
        return False

def get_user_workflow_activations(user_id: str) -> List[Dict]:
    """Get all workflow activations for a user"""
    try:
        result = get_db().table('workflow_activations').select('*, workflows(*)').eq('user_id', user_id).order('created_at', desc=True).execute()
        return result.data or []
    except:
        return []


def get_all_workflow_activations(limit: int = 0) -> List[Dict]:
    """Get all workflow activations (optionally limit results)"""
    try:
        query = get_db().table('workflow_activations').select('*').order('created_at', desc=True)
        if limit and limit > 0:
            query = query.limit(limit)
        result = query.execute()
        return result.data or []
    except:
        return []

def get_workflow_activation(user_id: str, workflow_id: str) -> Optional[Dict]:
    """Get specific workflow activation"""
    try:
        result = get_db().table('workflow_activations').select('*').eq('user_id', user_id).eq('workflow_id', workflow_id).execute()
        return result.data[0] if result.data else None
    except:
        return None

def activate_workflow(user_or_company_id: str, workflow_id: str, config: Dict = None, is_company_level: bool = False) -> Dict:
    """Activate a workflow for a user or company"""
    try:
        activation_data = {
            'workflow_id': workflow_id,
            'is_active': True,
            'config': config or {},
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        if is_company_level:
            activation_data['company_id'] = user_or_company_id
            activation_data['user_id'] = None
            # Check if already exists
            query = get_db().table('workflow_activations').select('*').eq('company_id', user_or_company_id).eq('workflow_id', workflow_id)
        else:
            activation_data['user_id'] = user_or_company_id
            activation_data['company_id'] = None
            # Check if already exists
            query = get_db().table('workflow_activations').select('*').eq('user_id', user_or_company_id).eq('workflow_id', workflow_id)
        
        existing_result = query.execute()
        existing = existing_result.data[0] if existing_result.data else None
        
        if existing:
            # Update existing
            result = get_db().table('workflow_activations').update({
                'is_active': True,
                'config': config or existing.get('config', {}),
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', existing['id']).execute()
            return result.data[0] if result.data else existing
        
        # Create new
        result = get_db().table('workflow_activations').insert(activation_data).execute()
        return result.data[0]
    except Exception as e:
        print(f"Error activating workflow: {e}")
        raise

def deactivate_workflow(user_or_company_id: str, workflow_id: str, is_company_level: bool = False) -> bool:
    """Deactivate a workflow for a user or company"""
    try:
        query = get_db().table('workflow_activations').select('id')
        if is_company_level:
            query = query.eq('company_id', user_or_company_id)
        else:
            query = query.eq('user_id', user_or_company_id)
        query = query.eq('workflow_id', workflow_id)
        
        result = query.execute()
        if result.data:
            activation_id = result.data[0]['id']
            get_db().table('workflow_activations').update({
                'is_active': False,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', activation_id).execute()
            return True
        return False
    except:
        return False

def get_workflow_api_keys(activation_id: str) -> List[Dict]:
    """Get API keys for a workflow activation"""
    try:
        result = get_db().table('workflow_api_keys').select('*').eq('workflow_activation_id', activation_id).execute()
        return result.data or []
    except:
        return []

def set_workflow_api_key(activation_id: str, service_type: str, api_key: str, config: Dict = None) -> Dict:
    """Set or update API key for a workflow activation"""
    try:
        # Check if exists
        existing_result = get_db().table('workflow_api_keys').select('*').eq('workflow_activation_id', activation_id).eq('service_type', service_type).execute()
        existing = existing_result.data[0] if existing_result.data else None
        
        key_data = {
            'workflow_activation_id': activation_id,
            'service_type': service_type,
            'api_key': api_key,
            'config': config or {},
            'updated_at': datetime.utcnow().isoformat()
        }
        
        if existing:
            # Update
            result = get_db().table('workflow_api_keys').update(key_data).eq('id', existing['id']).execute()
            return result.data[0] if result.data else existing
        else:
            # Create
            key_data['created_at'] = datetime.utcnow().isoformat()
            result = get_db().table('workflow_api_keys').insert(key_data).execute()
            return result.data[0]
    except Exception as e:
        print(f"Error setting workflow API key: {e}")
        raise

def delete_workflow_api_key(activation_id: str, service_type: str) -> bool:
    """Delete API key for a workflow activation"""
    try:
        get_db().table('workflow_api_keys').delete().eq('workflow_activation_id', activation_id).eq('service_type', service_type).execute()
        return True
    except:
        return False

def log_workflow_execution(activation_id: str, execution_data: Dict) -> Dict:
    """Log a workflow execution"""
    try:
        execution_log = {
            'workflow_activation_id': activation_id,
            'n8n_execution_id': execution_data.get('n8n_execution_id'),
            'status': execution_data.get('status', 'running'),
            'input_data': execution_data.get('input_data'),
            'output_data': execution_data.get('output_data'),
            'error_message': execution_data.get('error_message'),
            'started_at': execution_data.get('started_at', datetime.utcnow().isoformat()),
            'finished_at': execution_data.get('finished_at'),
            'duration_ms': execution_data.get('duration_ms')
        }
        result = get_db().table('workflow_executions').insert(execution_log).execute()
        
        # Update activation stats
        activation = get_db().table('workflow_activations').select('*').eq('id', activation_id).execute()
        if activation.data:
            current_count = activation.data[0].get('execution_count', 0)
            get_db().table('workflow_activations').update({
                'execution_count': current_count + 1,
                'last_executed_at': execution_log['started_at'],
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', activation_id).execute()
        
        return result.data[0]
    except Exception as e:
        print(f"Error logging workflow execution: {e}")
        raise

def get_workflow_executions(activation_id: str, limit: int = 50) -> List[Dict]:
    """Get execution history for a workflow activation"""
    try:
        result = get_db().table('workflow_executions').select('*').eq('workflow_activation_id', activation_id).order('started_at', desc=True).limit(limit).execute()
        return result.data or []
    except:
        return []

def get_all_workflow_executions(workflow_id: str = None, limit: int = 100) -> List[Dict]:
    """Get all workflow executions (admin only)"""
    try:
        query = get_db().table('workflow_executions').select('*, workflow_activations!inner(company_id, workflow_id, user_id, workflows(*))')
        if workflow_id:
            query = query.eq('workflow_activations.workflow_id', workflow_id)
        result = query.order('started_at', desc=True).limit(limit).execute()
        return result.data or []
    except:
        return []

# ============================================================================
# COMPANY OPERATIONS
# ============================================================================

def get_companies() -> List[Dict]:
    """Get all companies (admin only)"""
    try:
        result = get_db().table('companies').select('*').order('created_at', desc=True).execute()
        return result.data or []
    except:
        return []

def get_company_by_id(company_id: str) -> Optional[Dict]:
    """Get company by ID"""
    try:
        result = get_db().table('companies').select('*').eq('id', company_id).execute()
        return result.data[0] if result.data else None
    except:
        return None

def get_company_by_slug(slug: str) -> Optional[Dict]:
    """Get company by slug"""
    try:
        result = get_db().table('companies').select('*').eq('slug', slug).execute()
        return result.data[0] if result.data else None
    except:
        return None

def create_company(name: str, slug: str, settings: Dict = None) -> Dict:
    """Create a new company with validation"""
    # Validate name
    if not name or len(name.strip()) < 2:
        raise ValueError("Company name must be at least 2 characters")
    if len(name) > 100:
        raise ValueError("Company name must be less than 100 characters")
    
    # Validate and normalize slug
    slug = slug.strip().lower()
    if not slug:
        # Auto-generate slug from name
        slug = name.lower().replace(' ', '-').replace('_', '-')
        # Remove special characters
        import re
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        slug = re.sub(r'-+', '-', slug).strip('-')
    
    if len(slug) < 2:
        raise ValueError("Company slug must be at least 2 characters")
    if len(slug) > 50:
        raise ValueError("Company slug must be less than 50 characters")
    if not re.match(r'^[a-z0-9-]+$', slug):
        raise ValueError("Company slug can only contain lowercase letters, numbers, and hyphens")
    
    # Check if slug already exists
    existing = get_company_by_slug(slug)
    if existing:
        raise ValueError(f"Company with slug '{slug}' already exists")
    
    company_data = {
        'name': name.strip(),
        'slug': slug,
        'settings': settings or {},
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    try:
        result = get_db().table('companies').insert(company_data).execute()
        return result.data[0]
    except Exception as e:
        error_str = str(e).lower()
        if 'unique' in error_str or 'duplicate' in error_str:
            raise ValueError(f"Company with slug '{slug}' already exists")
        print(f"Error creating company: {e}")
        raise

def update_company(company_id: str, updates: Dict) -> bool:
    """Update company"""
    try:
        updates['updated_at'] = datetime.utcnow().isoformat()
        get_db().table('companies').update(updates).eq('id', company_id).execute()
        return True
    except:
        return False

def delete_company(company_id: str) -> bool:
    """Delete company"""
    try:
        get_db().table('companies').delete().eq('id', company_id).execute()
        return True
    except:
        return False

def get_company_users(company_id: str) -> List[Dict]:
    """Get all users for a company"""
    try:
        result = get_db().table('users').select('*').eq('company_id', company_id).order('created_at', desc=True).execute()
        return result.data or []
    except:
        return []

def get_company_activations(company_id: str) -> List[Dict]:
    """Get all workflow activations for a company"""
    try:
        result = get_db().table('workflow_activations').select('*, workflows(*)').eq('company_id', company_id).execute()
        return result.data or []
    except:
        return []

def assign_user_to_company(user_id: str, company_id: str, role: str = None) -> bool:
    """Assign user to a company"""
    try:
        update_data = {'company_id': company_id}
        if role:
            update_data['role'] = role
        get_db().table('users').update(update_data).eq('id', user_id).execute()
        return True
    except:
        return False

def remove_user_from_company(user_id: str) -> bool:
    """Remove user from company (set company_id to None)"""
    try:
        get_db().table('users').update({'company_id': None}).eq('id', user_id).execute()
        return True
    except:
        return False

def get_company_executions(company_id: str, limit: int = 100) -> List[Dict]:
    """Get all workflow executions for a company"""
    try:
        result = get_db().table('workflow_executions').select('*, workflow_activations!inner(workflow_id, workflows(*))').eq('workflow_activations.company_id', company_id).order('started_at', desc=True).limit(limit).execute()
        return result.data or []
    except:
        return []

