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
app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'  # Secure cookies in production

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

@app.route('/init-theo', methods=['GET', 'POST'])
def init_theo_page():
    """Simple page to initialize Theo - can be accessed via browser"""
    if request.method == 'POST' or request.args.get('init') == 'true':
        try:
            user = auth.create_user_admin('Theo', role='ceo')
            return jsonify({
                'success': True,
                'message': 'Theo initialized successfully as CEO',
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'role': user.get('role', 'ceo')
                },
                'next_step': 'Go to /login and enter "Theo" as username'
            })
        except Exception as e:
            error_msg = str(e)
            # Check if it's a table not found error
            if 'table' in error_msg.lower() and 'users' in error_msg.lower():
                error_msg = (
                    "Database tables not found! You need to create the tables first. "
                    "Go to your Supabase Dashboard → SQL Editor and run the contents of "
                    "'supabase_schema.sql'. See DATABASE_SETUP.md for detailed instructions."
                )
            return jsonify({
                'success': False,
                'error': error_msg,
                'message': 'Failed to initialize Theo',
                'help': 'If you see "table not found", you need to run the SQL schema in Supabase first.'
            }), 400
    
    # GET request - show simple HTML page
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Initialize Theo</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            button { padding: 10px 20px; font-size: 16px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #1e40af; }
            .result { margin-top: 20px; padding: 15px; border-radius: 5px; }
            .success { background: #d1fae5; border: 1px solid #10b981; color: #065f46; }
            .error { background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; }
        </style>
    </head>
    <body>
        <h1>Initialize Theo as CEO</h1>
        <p>Click the button below to create the user "Theo" with CEO/admin privileges.</p>
        <button onclick="initTheo()">Initialize Theo</button>
        <div id="result"></div>
        <script>
            async function initTheo() {
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = '<p>Initializing...</p>';
                try {
                    const response = await fetch('/init-theo?init=true', { method: 'POST' });
                    const data = await response.json();
                    if (data.success) {
                        resultDiv.className = 'result success';
                        resultDiv.innerHTML = '<h3>✓ Success!</h3><p>' + data.message + '</p><p><strong>Next:</strong> ' + data.next_step + '</p>';
                    } else {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '<h3>✗ Error</h3><p>' + data.error + '</p>';
                    }
                } catch (error) {
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = '<h3>✗ Error</h3><p>Network error: ' + error.message + '</p>';
                }
            }
        </script>
    </body>
    </html>
    '''

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
    """Redirect to dashboard overview"""
    return redirect(url_for('dashboard_overview'))

# Dashboard Routes
@app.route('/dashboard/overview')
@auth.login_required
def dashboard_overview():
    """Dashboard overview page"""
    try:
        user = auth.current_user()
        api_keys = db.get_api_keys(user['id'])
        
        # Placeholder data - to be replaced with actual data from database
        return render_template('dashboard/overview.html', 
                             user=user,
                             active_workflows_count=0,
                             api_keys_count=len(api_keys),
                             integrations_count=0,
                             recent_activity_count=0,
                             recent_workflows=[])
    except Exception as e:
        print(f"Dashboard overview error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/dashboard/workflows')
@auth.login_required
def dashboard_workflows():
    """Workflows list page"""
    try:
        user = auth.current_user()
        # Placeholder - to be replaced with actual workflows from database
        workflows = []
        return render_template('dashboard/workflows.html', user=user, workflows=workflows)
    except Exception as e:
        print(f"Dashboard workflows error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/dashboard/workflows/create')
@auth.login_required
def dashboard_workflow_create():
    """Create new workflow page"""
    try:
        user = auth.current_user()
        return render_template('dashboard/workflow-detail.html', user=user, workflow=None)
    except Exception as e:
        print(f"Dashboard workflow create error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/dashboard/workflows/<workflow_id>')
@auth.login_required
def dashboard_workflow_detail(workflow_id):
    """Workflow detail/edit page"""
    try:
        user = auth.current_user()
        # Placeholder - to be replaced with actual workflow from database
        workflow = {'id': workflow_id, 'name': 'Sample Workflow', 'status': 'inactive', 'description': ''}
        return render_template('dashboard/workflow-detail.html', user=user, workflow=workflow)
    except Exception as e:
        print(f"Dashboard workflow detail error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/dashboard/api-keys')
@auth.login_required
def dashboard_api_keys():
    """API Keys management page"""
    try:
        user = auth.current_user()
        api_keys = db.get_api_keys(user['id'])
        return render_template('dashboard/api-keys.html', user=user, api_keys=api_keys)
    except Exception as e:
        print(f"Dashboard API keys error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/dashboard/integrations')
@auth.login_required
def dashboard_integrations():
    """Integrations management page"""
    try:
        user = auth.current_user()
        # Placeholder - to be replaced with actual integration status from database
        return render_template('dashboard/integrations.html', 
                             user=user,
                             n8n_connected=False,
                             n8n_instance_url=None,
                             notion_connected=False,
                             openai_connected=len([k for k in db.get_api_keys(user['id']) if k.get('type', '').lower() == 'openai']) > 0)
    except Exception as e:
        print(f"Dashboard integrations error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/dashboard/settings')
@auth.login_required
def dashboard_settings():
    """Settings page"""
    try:
        user = auth.current_user()
        # Placeholder - to be replaced with actual workflow defaults from database
        workflow_defaults = {}
        return render_template('dashboard/settings.html', user=user, workflow_defaults=workflow_defaults)
    except Exception as e:
        print(f"Dashboard settings error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/dashboard/analytics')
@auth.login_required
def dashboard_analytics():
    """Analytics page (placeholder)"""
    try:
        user = auth.current_user()
        return render_template('dashboard/analytics.html', user=user)
    except Exception as e:
        print(f"Dashboard analytics error: {str(e)}")
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
    # Note: In production, this should require admin auth
    # For now, allowing it for setup purposes
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    role = (data.get('role') or 'user').strip()
    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters'}), 400
    if role not in ('user', 'admin', 'ceo'):
        role = 'user'
    try:
        user = auth.create_user_admin(name, role=role)
        return jsonify({'message': 'User created. They can now set their password on first login.', 'user': {'id': user['id'], 'name': user['name'], 'role': user.get('role', 'user')}})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/init-theo', methods=['POST'])
def api_init_theo():
    """Initialize Theo as CEO - one-time setup endpoint"""
    # This is a special endpoint to initialize Theo
    # Should be secured in production
    try:
        user = auth.create_user_admin('Theo', role='ceo')
        return jsonify({
            'message': 'Theo initialized successfully as CEO',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'role': user.get('role', 'ceo')
            }
        })
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
    
    # Get client IP for rate limiting
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    if ip_address:
        ip_address = ip_address.split(',')[0].strip()
    
    try:
        user = auth.setup_password(name, password, ip_address)
        return jsonify({'message': 'Password set successfully', 'user': {'id': user['id'], 'name': user['name']}})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/check-user', methods=['POST'])
def api_check_user():
    """Check if user exists and password status (for progressive login)"""
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name or len(name) < 2:
        return jsonify({'error': 'Name is required'}), 400
    
    # Get client IP for rate limiting
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    if ip_address:
        ip_address = ip_address.split(',')[0].strip()
    
    try:
        result = auth.check_user_status(name, ip_address)
        if result.get('error'):
            return jsonify({'error': result['error']}), 429
        return jsonify(result)
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
    
    # Get client IP for rate limiting
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    if ip_address:
        ip_address = ip_address.split(',')[0].strip()
    
    try:
        user = auth.login(name, password, ip_address)
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

# Workflow API Routes
@app.route('/api/workflows', methods=['GET'])
@auth.login_required
def api_list_workflows():
    """List all workflows for the current user"""
    user = auth.current_user()
    # Placeholder - to be replaced with actual database query
    return jsonify([])

@app.route('/api/workflows', methods=['POST'])
@auth.login_required
def api_create_workflow():
    """Create a new workflow"""
    user = auth.current_user()
    data = request.get_json() or {}
    # Placeholder - to be replaced with actual database insert
    return jsonify({'message': 'Workflow created', 'id': 'placeholder'})

@app.route('/api/workflows/<workflow_id>', methods=['GET'])
@auth.login_required
def api_get_workflow(workflow_id):
    """Get a specific workflow"""
    user = auth.current_user()
    # Placeholder - to be replaced with actual database query
    return jsonify({'id': workflow_id, 'name': 'Sample Workflow', 'status': 'inactive'})

@app.route('/api/workflows/<workflow_id>', methods=['PUT'])
@auth.login_required
def api_update_workflow(workflow_id):
    """Update a workflow"""
    user = auth.current_user()
    data = request.get_json() or {}
    # Placeholder - to be replaced with actual database update
    return jsonify({'message': 'Workflow updated'})

@app.route('/api/workflows/<workflow_id>', methods=['DELETE'])
@auth.login_required
def api_delete_workflow(workflow_id):
    """Delete a workflow"""
    user = auth.current_user()
    # Placeholder - to be replaced with actual database delete
    return jsonify({'message': 'Workflow deleted'})

@app.route('/api/workflows/<workflow_id>/run', methods=['POST'])
@auth.login_required
def api_run_workflow(workflow_id):
    """Run a workflow"""
    user = auth.current_user()
    # Placeholder - to be replaced with actual workflow execution
    return jsonify({'message': 'Workflow started'})

# Integration API Routes
@app.route('/api/integrations/n8n/connect', methods=['POST'])
@auth.login_required
def api_connect_n8n():
    """Connect to n8n instance"""
    user = auth.current_user()
    data = request.get_json() or {}
    # Placeholder - to be replaced with actual n8n connection logic
    return jsonify({'message': 'n8n connected successfully'})

@app.route('/api/integrations/n8n/disconnect', methods=['POST'])
@auth.login_required
def api_disconnect_n8n():
    """Disconnect from n8n instance"""
    user = auth.current_user()
    # Placeholder - to be replaced with actual n8n disconnection logic
    return jsonify({'message': 'n8n disconnected successfully'})

@app.route('/api/integrations/notion/disconnect', methods=['POST'])
@auth.login_required
def api_disconnect_notion():
    """Disconnect from Notion"""
    user = auth.current_user()
    # Placeholder - to be replaced with actual Notion disconnection logic
    return jsonify({'message': 'Notion disconnected successfully'})

# User Settings API Routes
@app.route('/api/user/profile', methods=['PUT', 'POST'])
@auth.login_required
def api_update_profile():
    """Update user profile"""
    user = auth.current_user()
    data = request.get_json() or {}
    # Placeholder - to be replaced with actual profile update logic
    return jsonify({'message': 'Profile updated'})

@app.route('/api/user/password', methods=['POST'])
@auth.login_required
def api_change_password():
    """Change user password"""
    user = auth.current_user()
    data = request.get_json() or {}
    # Placeholder - to be replaced with actual password change logic
    return jsonify({'message': 'Password changed'})

@app.route('/api/user/workflow-defaults', methods=['POST'])
@auth.login_required
def api_save_workflow_defaults():
    """Save workflow defaults"""
    user = auth.current_user()
    data = request.get_json() or {}
    # Placeholder - to be replaced with actual defaults save logic
    return jsonify({'message': 'Workflow defaults saved'})

# Expose app as 'application' for Vercel's Python runtime
application = app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', '5000')), debug=os.getenv('FLASK_DEBUG') == '1')
