"""Authentication - handles login, register, sessions"""
import hashlib
import secrets
from typing import Optional, Tuple
from flask import session, redirect, url_for, request, jsonify
from functools import wraps
import db


def hash_token(token: str) -> str:
    """Hash token for comparison"""
    return hashlib.sha256(token.encode()).hexdigest()


def register(name: str) -> Tuple[dict, str]:
    """Register new user - returns (user, plain_token)"""
    existing = db.get_user_by_name(name)
    if existing:
        raise ValueError('User already exists. Please log in.')
    
    token = secrets.token_hex(32)  # 64 char secure token
    token_hash = db.hash_token(token)
    user = db.create_user(name, token_hash)
    
    # Auto-login
    session.permanent = True
    session['user_id'] = user['id']
    session['token_hash'] = token_hash
    return user, token


def login(name: str, token: str) -> dict:
    """Login user with name and token"""
    user = db.get_user_by_name(name)
    if not user:
        raise ValueError('User not found')
    
    token_hash = hash_token(token)
    if token_hash != user.get('token_hash'):
        raise ValueError('Invalid token')
    
    # Create session
    session.permanent = True
    session['user_id'] = user['id']
    session['token_hash'] = token_hash
    return user


def logout():
    """Logout user"""
    session.clear()


def current_user() -> Optional[dict]:
    """Get current logged-in user"""
    user_id = session.get('user_id')
    token_hash = session.get('token_hash')
    if not user_id or not token_hash:
        return None
    
    user = db.get_user_by_id(user_id)
    if not user or user.get('token_hash') != token_hash:
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

