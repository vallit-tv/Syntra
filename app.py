"""Main Flask application"""
from datetime import timedelta
import os
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, abort
from dotenv import load_dotenv
import auth
import db

load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.getenv('FLASK_SECRET_KEY', os.urandom(32))
app.permanent_session_lifetime = timedelta(minutes=30)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# ============================================================================
# PAGES
# ============================================================================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/features')
def features():
    return render_template('features.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/impressum')
def impressum():
    return render_template('impressum.html')

@app.route('/datenschutz')
def datenschutz():
    return render_template('datenschutz.html')

@app.route('/dashboard')
@auth.login_required
def dashboard():
    user = auth.current_user()
    api_keys = db.get_api_keys(user['id'])
    return render_template('dashboard.html', user=user, api_keys=api_keys)

@app.route('/logout')
def logout():
    auth.logout()
    return redirect(url_for('index'))

# ============================================================================
# APIs
# ============================================================================

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters'}), 400
    try:
        user, token = auth.register(name)
        return jsonify({'message': 'Registered', 'user': user, 'token': token})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    token = (data.get('token') or '').strip()
    if not name or not token:
        return jsonify({'error': 'Name and token required'}), 400
    try:
        user = auth.login(name, token)
        return jsonify({'message': 'Logged in', 'user': user})
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/api/user/profile')
@auth.login_required
def api_profile():
    return jsonify(auth.current_user())

@app.route('/api/keys', methods=['GET'])
@auth.login_required
def api_list_keys():
    user = auth.current_user()
    return jsonify(db.get_api_keys(user['id']))

@app.route('/api/keys', methods=['POST'])
@auth.login_required
def api_create_key():
    user = auth.current_user()
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    key_type = (data.get('type') or '').strip()
    value = (data.get('key') or '').strip()
    if not name or not key_type or not value:
        return jsonify({'error': 'name, type, key required'}), 400
    db.create_api_key(user['id'], {'name': name, 'type': key_type, 'key_value': value})
    return jsonify({'message': 'Created'})

@app.route('/api/keys/<key_id>', methods=['DELETE'])
@auth.login_required
def api_delete_key(key_id):
    user = auth.current_user()
    if not db.delete_api_key(key_id, user['id']):
        abort(404)
    return jsonify({'message': 'Deleted'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', '5000')), debug=os.getenv('FLASK_DEBUG') == '1')
