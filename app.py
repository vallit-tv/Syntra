"""Main Flask application"""
from datetime import timedelta
import os
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, abort, send_file
from dotenv import load_dotenv
import auth
import db

load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='/static', template_folder='templates')
app.secret_key = os.getenv('FLASK_SECRET_KEY', os.urandom(32))
app.permanent_session_lifetime = timedelta(minutes=30)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Explicitly ensure static files are accessible
# Flask serves static files automatically, but this ensures proper handling on Vercel
from flask import send_from_directory, make_response
import mimetypes

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files with proper MIME types and caching headers"""
    try:
        file_path = os.path.join(app.static_folder, filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"Static file not found: {file_path}")
            abort(404)
        
        # Determine MIME type
        mimetype, _ = mimetypes.guess_type(file_path)
        if not mimetype:
            if filename.endswith('.css'):
                mimetype = 'text/css'
            elif filename.endswith('.js'):
                mimetype = 'application/javascript'
            elif filename.endswith('.png'):
                mimetype = 'image/png'
            elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
                mimetype = 'image/jpeg'
            elif filename.endswith('.svg'):
                mimetype = 'image/svg+xml'
        
        # Use send_file for better control
        response = send_file(file_path, mimetype=mimetype)
        
        # Set proper headers
        if mimetype in ['text/css', 'text/html', 'application/javascript']:
            response.headers['Content-Type'] = f'{mimetype}; charset=utf-8'
        else:
            response.headers['Content-Type'] = mimetype
        
        response.headers['Cache-Control'] = 'public, max-age=3600'
        return response
    except Exception as e:
        print(f"Error serving static file {filename}: {str(e)}")
        import traceback
        traceback.print_exc()
        abort(404)

# Error handlers
@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    import traceback
    error_msg = traceback.format_exc()
    print(f"ERROR: {error_msg}")  # Log to Vercel logs
    return jsonify({'error': 'Internal Server Error', 'message': str(error)}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    """Handle all exceptions"""
    import traceback
    error_msg = traceback.format_exc()
    print(f"ERROR: {error_msg}")  # Log to Vercel logs
    return jsonify({'error': 'An error occurred', 'message': str(e)}), 500

# ============================================================================
# PAGES
# ============================================================================

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Flask app is running'}), 200

@app.route('/')
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        print(f"Index route error: {str(e)}")
        return f"Error loading page: {str(e)}", 500

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
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/setup-password')
def setup_password():
    return render_template('setup-password.html')

@app.route('/impressum')
def impressum():
    return render_template('impressum.html')

@app.route('/datenschutz')
def datenschutz():
    return render_template('datenschutz.html')

@app.route('/dashboard')
@auth.login_required
def dashboard():
    try:
        user = auth.current_user()
        api_keys = db.get_api_keys(user['id'])
        return render_template('dashboard.html', user=user, api_keys=api_keys)
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/logout')
def logout():
    auth.logout()
    return redirect(url_for('index'))

# ============================================================================
# APIs
# ============================================================================

@app.route('/api/admin/create-user', methods=['POST'])
def api_create_user():
    """Admin endpoint to create a new user (password not set yet)"""
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters'}), 400
    try:
        user = auth.create_user_admin(name)
        return jsonify({'message': 'User created. They can now set their password on first login.', 'user': {'id': user['id'], 'name': user['name']}})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/setup-password', methods=['POST'])
def api_setup_password():
    """Setup password for first-time login"""
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    password = data.get('password') or ''
    if not name or not password:
        return jsonify({'error': 'Name and password required'}), 400
    try:
        user = auth.setup_password(name, password)
        return jsonify({'message': 'Password set successfully', 'user': {'id': user['id'], 'name': user['name']}})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    """Login with name and password"""
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    password = data.get('password') or ''
    if not name or not password:
        return jsonify({'error': 'Name and password required'}), 400
    try:
        user = auth.login(name, password)
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

# Expose app as 'application' for Vercel's Python runtime
application = app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', '5000')), debug=os.getenv('FLASK_DEBUG') == '1')
