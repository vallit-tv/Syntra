"""Authentication - handles login, password setup, sessions"""
import hashlib
import secrets
from typing import Optional, Tuple
from flask import session, redirect, url_for, request, jsonify
from functools import wraps
import db


def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash


def create_user_admin(name: str) -> dict:
    """Create user by admin (user exists but password not set yet)"""
    existing = db.get_user_by_name(name)
    if existing:
        raise ValueError('User already exists')
    
    user = db.create_user(name, is_password_set=False)
    return user


def setup_password(name: str, password: str) -> dict:
    """Setup password for first-time login"""
    # Validate password strength
    if len(password) < 8:
        raise ValueError('Password must be at least 8 characters long')
    if not any(c.isupper() for c in password):
        raise ValueError('Password must contain at least one uppercase letter')
    if not any(c.islower() for c in password):
        raise ValueError('Password must contain at least one lowercase letter')
    if not any(c.isdigit() for c in password):
        raise ValueError('Password must contain at least one number')
    
    user = db.get_user_by_name(name)
    if not user:
        raise ValueError('User not found. Please contact an administrator.')
    
    if user.get('is_password_set'):
        raise ValueError('Password already set. Please login.')
    
    password_hash = hash_password(password)
    db.update_user_password(user['id'], password_hash)
    
    # Auto-login after password setup
    user = db.get_user_by_id(user['id'])  # Refresh user data
    session.permanent = True
    session['user_id'] = user['id']
    return user


def login(name: str, password: str) -> dict:
    """Login user with name and password"""
    user = db.get_user_by_name(name)
    if not user:
        raise ValueError('Invalid credentials')
    
    if not user.get('is_password_set'):
        raise ValueError('Password not set. Please set your password first.')
    
    if not user.get('password_hash'):
        raise ValueError('Invalid credentials')
    
    if not verify_password(password, user['password_hash']):
        raise ValueError('Invalid credentials')
    
    # Create session
    session.permanent = True
    session['user_id'] = user['id']
    return user


def logout():
    """Logout user"""
    session.clear()


def current_user() -> Optional[dict]:
    """Get current logged-in user"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    
    user = db.get_user_by_id(user_id)
    if not user:
        return None
    
    return {'id': user['id'], 'name': user['name']}


def login_required(f):
    """Decorator to protect routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user():
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized'}), 401
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

