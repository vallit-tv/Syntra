"""Authentication - handles login, password setup, sessions"""
import hashlib
import secrets
import time
import os
from typing import Optional, Tuple, Dict
from flask import session, redirect, url_for, request, jsonify
from functools import wraps
import db
import traceback

# Rate limiting storage (in production, use Redis or database)
_rate_limit_store: Dict[str, Dict] = {}


# Rate limiting configuration
RATE_LIMIT_ATTEMPTS = 5  # Max attempts per window
RATE_LIMIT_WINDOW = 300  # 5 minutes in seconds
LOCKOUT_DURATION = 900  # 15 minutes lockout after max attempts

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def _get_rate_limit_key(identifier: str, endpoint: str) -> str:
    """Get rate limit key for identifier and endpoint"""
    return f"{endpoint}:{identifier}"


def check_rate_limit(identifier: str, endpoint: str = 'auth') -> Tuple[bool, Optional[str]]:
    """
    Check if identifier is rate limited.
    Returns (allowed, error_message)
    """
    key = _get_rate_limit_key(identifier, endpoint)
    now = time.time()
    
    if key not in _rate_limit_store:
        _rate_limit_store[key] = {
            'attempts': [],
            'locked_until': None
        }
    
    record = _rate_limit_store[key]
    
    # Check if locked
    if record['locked_until'] and now < record['locked_until']:
        remaining = int(record['locked_until'] - now)
        return False, f"Too many attempts. Please try again in {remaining // 60 + 1} minutes."
    
    # Clear lock if expired
    if record['locked_until'] and now >= record['locked_until']:
        record['locked_until'] = None
        record['attempts'] = []
    
    # Clean old attempts outside the window
    record['attempts'] = [t for t in record['attempts'] if now - t < RATE_LIMIT_WINDOW]
    
    # Check if limit exceeded
    if len(record['attempts']) >= RATE_LIMIT_ATTEMPTS:
        record['locked_until'] = now + LOCKOUT_DURATION
        return False, f"Too many attempts. Account locked for {LOCKOUT_DURATION // 60} minutes."
    
    return True, None


def record_rate_limit_attempt(identifier: str, endpoint: str = 'auth', failed: bool = True):
    """Record a rate limit attempt"""
    if not failed:
        # Clear attempts on successful login
        key = _get_rate_limit_key(identifier, endpoint)
        if key in _rate_limit_store:
            _rate_limit_store[key]['attempts'] = []
            _rate_limit_store[key]['locked_until'] = None
        return
    
    key = _get_rate_limit_key(identifier, endpoint)
    now = time.time()
    
    if key not in _rate_limit_store:
        _rate_limit_store[key] = {
            'attempts': [],
            'locked_until': None
        }
    
    _rate_limit_store[key]['attempts'].append(now)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash


def create_user_admin(name: str, role: str = 'worker', company_id: str = None) -> dict:
    """Create or update a user via admin flows (password not set yet)."""
    try:
        existing = db.get_user_by_name(name)
        if existing:
            changed = False
            if role and existing.get('role') != role:
                print(f"Updating user '{name}' role to '{role}'")
                db.update_user_role(existing['id'], role)
                changed = True
            if company_id and existing.get('company_id') != company_id:
                print(f"Assigning user '{name}' to company '{company_id}'")
                db.assign_user_to_company(existing['id'], company_id)
                changed = True
            if changed:
                existing = db.get_user_by_id(existing['id']) or existing
            return existing

        print(f"Creating new user '{name}' with role '{role}'")
        user = db.create_user(
            name,
            is_password_set=False,
            role=role,
            company_id=company_id
        )
        if company_id and not user.get('company_id'):
            db.assign_user_to_company(user['id'], company_id)
            user = db.get_user_by_id(user['id']) or user
        print(f"User '{name}' created successfully with ID: {user.get('id')}")
        return user
    except Exception as e:
        print(f"Error in create_user_admin for '{name}': {e}")
        import traceback
        traceback.print_exc()
        existing = db.get_user_by_name(name)
        if existing:
            return existing
        raise


def setup_password(name: str, password: str, ip_address: str = None) -> dict:
    """Setup password for first-time login"""
    # Rate limiting
    identifier = ip_address or name
    allowed, error_msg = check_rate_limit(identifier, 'setup-password')
    if not allowed:
        raise ValueError(error_msg)
    
    # Validate password strength
    if len(password) < 8:
        record_rate_limit_attempt(identifier, 'setup-password', failed=True)
        raise ValueError('Password must be at least 8 characters long')
    if not any(c.isupper() for c in password):
        record_rate_limit_attempt(identifier, 'setup-password', failed=True)
        raise ValueError('Password must contain at least one uppercase letter')
    if not any(c.islower() for c in password):
        record_rate_limit_attempt(identifier, 'setup-password', failed=True)
        raise ValueError('Password must contain at least one lowercase letter')
    if not any(c.isdigit() for c in password):
        record_rate_limit_attempt(identifier, 'setup-password', failed=True)
        raise ValueError('Password must contain at least one number')
    
    user = db.get_user_by_name(name)
    if not user:
        record_rate_limit_attempt(identifier, 'setup-password', failed=True)
        raise ValueError('User not found. Please contact an administrator.')
    
    if user.get('is_password_set'):
        record_rate_limit_attempt(identifier, 'setup-password', failed=True)
        raise ValueError('Password already set. Please login.')
    
    password_hash = hash_password(password)
    db.update_user_password(user['id'], password_hash)
    
    # Clear rate limit on successful password setup
    record_rate_limit_attempt(identifier, 'setup-password', failed=False)
    
    # Auto-login after password setup
    user = db.get_user_by_id(user['id'])  # Refresh user data
    
    # Ensure role is set correctly (especially for Theo)
    role = user.get('role')
    if not role:
        if user.get('name', '').lower() == 'theo':
            role = 'admin'
            # Try to update role in database
            try:
                db.update_user_role(user['id'], 'admin')
                # Refresh user data
                user = db.get_user_by_id(user['id']) or user
            except Exception as e:
                print(f"Note: Could not update user role in database: {e}")
        else:
            role = 'worker'
    
    # Create session - CRITICAL: Mark as permanent BEFORE setting values
    session.permanent = True
    session['user_id'] = user['id']
    
    # Cache user info in session to avoid DB calls
    user_dict = {
        'id': user['id'],
        'name': user['name'],
        'role': role,
        'company_id': user.get('company_id'),
        'is_password_set': user.get('is_password_set', False)
    }
    session['user_info'] = user_dict
    session['user_info_time'] = time.time()
    
    # Explicitly mark session as modified to ensure it's saved
    session.modified = True
    
    # Force session to persist by accessing it
    _ = session.get('user_id')
    
    return user_dict


def login(name: str, password: str, ip_address: str = None) -> dict:
    """Login user with name and password"""
    # Rate limiting
    identifier = ip_address or name
    allowed, error_msg = check_rate_limit(identifier, 'login')
    if not allowed:
        raise ValueError(error_msg)
    
    user = db.get_user_by_name(name)
    if not user:
        record_rate_limit_attempt(identifier, 'login', failed=True)
        raise ValueError('Invalid credentials')
    
    if not user.get('is_password_set'):
        record_rate_limit_attempt(identifier, 'login', failed=True)
        raise ValueError('Password not set. Please set your password first.')
    
    if not user.get('password_hash'):
        record_rate_limit_attempt(identifier, 'login', failed=True)
        raise ValueError('Invalid credentials')
    
    if not verify_password(password, user['password_hash']):
        record_rate_limit_attempt(identifier, 'login', failed=True)
        raise ValueError('Invalid credentials')
    
    # Clear rate limit on successful login
    record_rate_limit_attempt(identifier, 'login', failed=False)
    
    # Ensure role is set correctly (especially for Theo)
    role = user.get('role')
    if not role:
        if user.get('name', '').lower() == 'theo':
            role = 'admin'
            # Try to update role in database
            try:
                db.update_user_role(user['id'], 'admin')
                # Refresh user data
                user = db.get_user_by_id(user['id']) or user
            except Exception as e:
                print(f"Note: Could not update user role in database: {e}")
        else:
            role = 'worker'
    
    # Create session - CRITICAL: Mark as permanent BEFORE setting values
    session.permanent = True
    session['user_id'] = user['id']
    
    # Cache user info in session to avoid DB calls
    user_dict = {
        'id': user['id'],
        'name': user['name'],
        'role': role,
        'company_id': user.get('company_id'),
        'is_password_set': user.get('is_password_set', False)
    }
    session['user_info'] = user_dict
    session['user_info_time'] = time.time()
    
    # Explicitly mark session as modified to ensure it's saved
    session.modified = True
    
    # Force session to persist by accessing it
    _ = session.get('user_id')
    
    # Debug: verify session was set
    print(f"DEBUG: Login successful for {user['name']}, session['user_id'] = {session.get('user_id')}, session keys: {list(session.keys())}")
    
    return user_dict


def check_user_status(name: str, ip_address: str = None) -> dict:
    """
    Check if user exists and password status.
    Security: Only returns minimal info to prevent enumeration.
    """
    # Rate limiting
    identifier = ip_address or name
    allowed, error_msg = check_rate_limit(identifier, 'check-user')
    if not allowed:
        # Return generic error to prevent enumeration
        return {'exists': False, 'needs_password': False, 'error': 'Rate limit exceeded'}
    
    try:
        user = db.get_user_by_name(name)
        if not user:
            # Auto-create Theo if he doesn't exist (for initial setup)
            if name.lower() == 'theo':
                try:
                    user = create_user_admin('Theo', role='admin')
                except Exception as e:
                    # If user already exists (race condition), fetch again
                    user = db.get_user_by_name('Theo')
                    if not user:
                        record_rate_limit_attempt(identifier, 'check-user', failed=True)
                        return {'exists': False, 'needs_password': False}
            else:
                record_rate_limit_attempt(identifier, 'check-user', failed=True)
                return {'exists': False, 'needs_password': False}
        
        # User exists - check password status
        needs_password = not user.get('is_password_set', False)
        return {'exists': True, 'needs_password': needs_password}
    except Exception as e:
        # Log error but don't reveal info
        print(f"Error checking user status: {e}")
        record_rate_limit_attempt(identifier, 'check-user', failed=True)
        return {'exists': False, 'needs_password': False}


def logout():
    """Logout user"""
    session.clear()
    # Also clear any cached user info
    if 'user_info' in session:
        del session['user_info']
    if 'user_info_time' in session:
        del session['user_info_time']


def current_user() -> Optional[dict]:
    """Get current logged-in user with caching in session"""
    # Ensure session is accessible
    if not hasattr(session, 'get'):
        print("DEBUG: Session object is not accessible")
        return None
        
    user_id = session.get('user_id')
    if not user_id:
        # Debug: log why user_id is missing (only in debug mode to reduce noise)
        if os.getenv('DEBUG') == '1' or os.getenv('DEBUG_SESSIONS') == '1':
            if not session:
                print("DEBUG: Session object is None or empty")
            else:
                print(f"DEBUG: Session exists but user_id is missing. Session keys: {list(session.keys())}")
        return None
    
    # Check if we have cached user info in session (to avoid DB calls on every request)
    cached_user = session.get('user_info')
    if cached_user and cached_user.get('id') == user_id:
        # Verify the cached user is still valid by checking session timestamp
        cache_time = session.get('user_info_time', 0)
        # Refresh cache every 5 minutes or if role is missing
        if time.time() - cache_time < 300 and cached_user.get('role'):
            return cached_user
    
    # Try to get user from database
    try:
        user = db.get_user_by_id(user_id)
        if not user:
            # If database query fails but we have cached info, use that
            if cached_user:
                print(f"Warning: Database query failed for user {user_id}, using cached user info")
                return cached_user
            return None
        
        # Ensure role is set correctly (especially for Theo)
        role = user.get('role')
        if not role:
            if user.get('name', '').lower() == 'theo':
                role = 'admin'
                # Try to update role in database, but don't fail if it doesn't work
                try:
                    if db.update_user_role(user['id'], 'admin'):
                        # Refresh user data if update succeeded
                        updated_user = db.get_user_by_id(user_id)
                        if updated_user:
                            user = updated_user
                            role = 'admin'
                except Exception as e:
                    # Silently fail - role will be set to 'admin' for this session anyway
                    print(f"Note: Could not update user role in database: {e}")
            else:
                role = 'worker'
        
        user_dict = {
            'id': user['id'],
            'name': user['name'],
            'role': role,
            'company_id': user.get('company_id')
        }
        
        # Cache user info in session
        session['user_info'] = user_dict
        session['user_info_time'] = time.time()
        # Ensure session is saved
        session.modified = True
        
        return user_dict
    except Exception as e:
        # If database query fails, try to use cached user info
        print(f"Error getting user from database: {e}")
        if cached_user:
            print(f"Using cached user info for user {user_id}")
            return cached_user
        return None


def is_admin(user: Optional[dict] = None) -> bool:
    """Check if user has admin role"""
    if not user:
        user = current_user()
    if not user:
        return False
    role = user.get('role', 'user')
    return role == 'admin'


def is_ceo(user: Optional[dict] = None) -> bool:
    """Check if user has CEO role"""
    if not user:
        user = current_user()
    if not user:
        return False
    return user.get('role') == 'ceo'


def is_worker(user: Optional[dict] = None) -> bool:
    """Check if user is a worker-level account"""
    if not user:
        user = current_user()
    if not user:
        return False
    return user.get('role') not in ('admin', 'ceo')


def admin_required(f):
    """Decorator to require admin access"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user = current_user()
            if not user:
                print(f"admin_required: No user found for session {session.get('user_id')}")
                if request.path.startswith('/api/'):
                    return jsonify({'error': 'Unauthorized'}), 401
                return redirect(url_for('login'))
            if not is_admin(user):
                print(f"admin_required: User {user.get('name')} (role: {user.get('role')}) is not admin")
                if request.path.startswith('/api/'):
                    return jsonify({'error': 'Admin access required'}), 403
                return redirect(url_for('dashboard'))
            return f(*args, **kwargs)
        except Exception as e:
            print(f"admin_required error: {e}")
            traceback.print_exc()
            # On error, try to use cached user info
            cached_user = session.get('user_info')
            if cached_user and is_admin(cached_user):
                print(f"Using cached user info after error")
                return f(*args, **kwargs)
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized'}), 401
            return redirect(url_for('login'))
    return decorated


def ceo_required(f):
    """Decorator to require CEO (or admin) access"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = current_user()
        if not user:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized'}), 401
            return redirect(url_for('login'))
        if not (is_ceo(user) or is_admin(user)):
            if request.path.startswith('/api/'):
                return jsonify({'error': 'CEO access required'}), 403
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated


def worker_required(f):
    """Decorator to require worker access"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = current_user()
        if not user:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized'}), 401
            return redirect(url_for('login'))
        if not is_worker(user):
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Worker access required'}), 403
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated


def login_required(f):
    """Decorator to protect routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = current_user()
        if not user:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized'}), 401
            # Redirect to login page instead of register
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

