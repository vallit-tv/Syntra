"""Main Flask application"""
from datetime import timedelta, datetime, timezone
from collections import Counter, defaultdict
import analytics_helper
import json
import os
import statistics
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, abort, send_file
from dotenv import load_dotenv
from dateutil import parser as date_parser
import auth
import db
from n8n_service import get_n8n_service

load_dotenv()

# Log environment variable status at startup (for Vercel debugging)
print("=" * 60)
print("ENVIRONMENT VARIABLES CHECK (Startup)")
print("=" * 60)
print(f"VERCEL env: {os.getenv('VERCEL')}")
print(f"VERCEL_URL: {os.getenv('VERCEL_URL')}")
print(f"SUPABASE_URL set: {bool(os.getenv('SUPABASE_URL'))}")
print(f"SUPABASE_KEY set: {bool(os.getenv('SUPABASE_KEY'))}")
print(f"SUPABASE_SERVICE_KEY set: {bool(os.getenv('SUPABASE_SERVICE_KEY'))}")
print(f"N8N_URL set: {bool(os.getenv('N8N_URL'))}")
print(f"N8N_API_KEY set: {bool(os.getenv('N8N_API_KEY'))}")
all_supabase_vars = [k for k in os.environ.keys() if 'SUPABASE' in k.upper()]
print(f"All SUPABASE* env vars: {all_supabase_vars}")
all_n8n_vars = [k for k in os.environ.keys() if 'N8N' in k.upper()]
print(f"All N8N* env vars: {all_n8n_vars}")
print("=" * 60)

app = Flask(__name__, static_folder='static', static_url_path='/static', template_folder='templates')
app.secret_key = os.getenv('FLASK_SECRET_KEY', os.urandom(32))
app.permanent_session_lifetime = timedelta(minutes=30)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
# On Vercel, always use secure cookies (HTTPS is always used)
app.config['SESSION_COOKIE_SECURE'] = os.getenv('VERCEL') == '1' or os.getenv('FLASK_ENV') == 'production'


def parse_iso_ts(value):
    """Parse ISO timestamp strings into datetime objects."""
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    try:
        value_str = value.strip()
        if value_str.endswith('Z'):
            value_str = value_str.replace('Z', '+00:00')
        return datetime.fromisoformat(value_str)
    except Exception:
        return None


def parse_required_services(raw_value):
    """Ensure required services metadata is consistently a list."""
    if not raw_value:
        return []
    if isinstance(raw_value, list):
        return raw_value
    if isinstance(raw_value, str):
        stripped = raw_value.strip()
        if not stripped:
            return []
        try:
            parsed = json.loads(stripped)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
        return [item.strip() for item in stripped.replace('[', '').replace(']', '').split(',') if item.strip()]
    return []


@app.template_filter('format_datetime')
def format_datetime_filter(value, mode='medium'):
    """Format datetime values for templates."""
    dt = value
    if not isinstance(dt, datetime):
        dt = parse_iso_ts(value)
    if not dt:
        return ''
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    if mode == 'relative':
        now = datetime.now(timezone.utc)
        delta = now - dt
        seconds = int(delta.total_seconds())
        future = seconds < 0
        seconds = abs(seconds)

        if seconds < 60:
            phrase = 'just now'
        elif seconds < 3600:
            minutes = seconds // 60
            phrase = f"{minutes} minute{'s' if minutes != 1 else ''}"
        elif seconds < 86400:
            hours = seconds // 3600
            phrase = f"{hours} hour{'s' if hours != 1 else ''}"
        elif seconds < 604800:
            days = seconds // 86400
            phrase = f"{days} day{'s' if days != 1 else ''}"
        else:
            weeks = seconds // 604800
            phrase = f"{weeks} week{'s' if weeks != 1 else ''}"
        if phrase == 'just now':
            return phrase
        return f"in {phrase}" if future else f"{phrase} ago"

    if mode == 'short':
        return dt.astimezone(timezone.utc).strftime('%b %d, %Y %H:%M UTC')

    # default medium format
    return dt.astimezone(timezone.utc).strftime('%B %d, %Y %H:%M UTC')


@app.template_filter('format_duration')
def format_duration_filter(value):
    """Format millisecond durations into a readable string."""
    if value is None:
        return ''
    try:
        total_ms = float(value)
    except (TypeError, ValueError):
        return str(value)

    total_seconds = int(total_ms // 1000)
    ms = int(total_ms % 1000)
    minutes, seconds = divmod(total_seconds, 60)
    hours, minutes = divmod(minutes, 60)

    parts = []
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    if seconds or not parts:
        parts.append(f"{seconds}s")
    if not hours and not minutes and ms:
        parts.append(f"{ms}ms")
    return ' '.join(parts)


@app.template_filter('ensure_list')
def ensure_list_filter(value):
    """Convert comma-separated strings or single values into lists for iteration."""
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    if not value:
        return []
    if isinstance(value, str):
        return [item.strip() for item in value.split(',') if item.strip()]
    return [value]


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
            # For favicon and other missing images, return 404 gracefully
            if 'favicon' in filename.lower() or filename.endswith(('.ico', '.png', '.jpg', '.jpeg', '.svg', '.gif')):
                abort(404)
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
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    # Check if this is an API request
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Not Found', 'message': 'The requested resource was not found'}), 404
    
    # For browser requests, return a simple 404 page
    try:
        return render_template('error.html', error_code=404, error_message='Page Not Found'), 404
    except:
        # If error template doesn't exist, return simple HTML
        return """
        <!DOCTYPE html>
        <html>
        <head><title>404 Not Found</title></head>
        <body>
            <h1>404 Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/">Go to Home</a>
        </body>
        </html>
        """, 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    import traceback
    error_msg = traceback.format_exc()
    print(f"ERROR: {error_msg}")  # Log to Vercel logs
    
    # Check if this is an API request
    if request.path.startswith('/api/'):
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An error occurred processing your request. Please try again later.'
        }), 500
    
    # For browser requests, return a simple error page
    try:
        return render_template('error.html', error_code=500, error_message='Internal Server Error'), 500
    except:
        # If error template doesn't exist, return simple HTML
        return """
        <!DOCTYPE html>
        <html>
        <head><title>Error 500</title></head>
        <body>
            <h1>Internal Server Error</h1>
            <p>An error occurred processing your request. Please try again later.</p>
        </body>
        </html>
        """, 500

@app.errorhandler(Exception)
def handle_exception(e):
    """Handle all exceptions"""
    import traceback
    error_msg = traceback.format_exc()
    print(f"ERROR: {error_msg}")  # Log to Vercel logs
    
    # Check if this is an API request
    if request.path.startswith('/api/'):
        # Don't expose internal error details in API responses
        error_message = 'An error occurred processing your request.'
        if 'database' in str(e).lower() or 'supabase' in str(e).lower():
            error_message = 'Database connection error. Please check your configuration.'
        return jsonify({
            'error': 'An error occurred',
            'message': error_message
        }), 500
    
    # For browser requests, return a user-friendly error page
    try:
        return render_template('error.html', error_code=500, error_message='An unexpected error occurred'), 500
    except:
        # If error template doesn't exist, return simple HTML
        return """
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body>
            <h1>An Error Occurred</h1>
            <p>An unexpected error occurred. Please try again later.</p>
        </body>
        </html>
        """, 500

# ============================================================================
# PAGES
# ============================================================================

@app.route('/health')
def health():
    """Health check endpoint - works without database"""
    try:
        # Check database connectivity (optional)
        db_connected, db_error = db.test_db_connection()
        status = {
            'status': 'ok',
            'message': 'Flask app is running',
            'database': {
                'connected': db_connected,
                'error': db_error if not db_connected else None
            }
        }
        # Return 200 even if database is not connected (app can run without it for health checks)
        return jsonify(status), 200
    except Exception as e:
        # Health endpoint should never fail - return basic status
        return jsonify({
            'status': 'ok',
            'message': 'Flask app is running',
            'database': {
                'connected': False,
                'error': str(e)
            }
        }), 200

@app.route('/debug/env')
def debug_env():
    """Debug endpoint to check environment variables (admin only)"""
    # Check which critical env vars are set (without exposing full values)
    env_status = {
        'SUPABASE_URL': {
            'set': bool(os.getenv('SUPABASE_URL')),
            'value_preview': os.getenv('SUPABASE_URL', '')[:30] + '...' if os.getenv('SUPABASE_URL') else None,
            'length': len(os.getenv('SUPABASE_URL', ''))
        },
        'SUPABASE_KEY': {
            'set': bool(os.getenv('SUPABASE_KEY')),
            'value_preview': os.getenv('SUPABASE_KEY', '')[:30] + '...' if os.getenv('SUPABASE_KEY') else None,
            'length': len(os.getenv('SUPABASE_KEY', ''))
        },
        'SUPABASE_SERVICE_KEY': {
            'set': bool(os.getenv('SUPABASE_SERVICE_KEY')),
            'value_preview': os.getenv('SUPABASE_SERVICE_KEY', '')[:30] + '...' if os.getenv('SUPABASE_SERVICE_KEY') else None,
            'length': len(os.getenv('SUPABASE_SERVICE_KEY', ''))
        },
        'N8N_URL': {
            'set': bool(os.getenv('N8N_URL')),
            'value_preview': os.getenv('N8N_URL', '')[:50] + '...' if os.getenv('N8N_URL') else None,
            'length': len(os.getenv('N8N_URL', ''))
        },
        'N8N_API_KEY': {
            'set': bool(os.getenv('N8N_API_KEY')),
            'value_preview': os.getenv('N8N_API_KEY', '')[:30] + '...' if os.getenv('N8N_API_KEY') else None,
            'length': len(os.getenv('N8N_API_KEY', ''))
        },
        'VERCEL': os.getenv('VERCEL'),
        'FLASK_ENV': os.getenv('FLASK_ENV'),
    }
    
    # Check database configuration
    db_configured = db.is_db_configured()
    db_connected, db_error = db.test_db_connection()
    
    return jsonify({
        'environment_variables': env_status,
        'database': {
            'configured': db_configured,
            'connected': db_connected,
            'error': db_error if not db_connected else None
        },
        'note': 'This endpoint shows which environment variables are set. Full values are hidden for security.'
    }), 200

@app.route('/init-theo', methods=['GET', 'POST'])
def init_theo_page():
    """Simple page to initialize Theo - can be accessed via browser"""
    if request.method == 'POST' or request.args.get('init') == 'true':
        try:
            user = auth.create_user_admin('Theo', role='admin')
            return jsonify({
                'success': True,
                'message': 'Theo initialized successfully as Admin',
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'role': user.get('role', 'admin')
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
        import traceback
        traceback.print_exc()
        # Return a simple error message instead of crashing
        return "<h1>Error</h1><p>Unable to load page. Please try again later.</p>", 500

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/setup-password')
def setup_password():
    return render_template('setup-password.html')

# ============================================================================
# CEO DASHBOARD ROUTES
# ============================================================================

@app.route('/company/dashboard')
@auth.ceo_required
def company_dashboard():
    """CEO dashboard overview"""
    try:
        user = auth.current_user()
        
        # Check if admin is viewing as company
        admin_viewing_mode = session.get('admin_viewing_mode', False)
        admin_viewing_company_id = session.get('admin_viewing_company_id')
        
        if admin_viewing_mode and admin_viewing_company_id:
            # Admin viewing a company
            company = db.get_company_by_id(admin_viewing_company_id)
        else:
            # Regular user accessing their company
            company = db.get_company_by_id(user.get('company_id'))
        
        if not company:
            return "No company assigned", 403
        
        # Get company activations
        activations = db.get_company_activations(company['id'])
        active_count = len([a for a in activations if a.get('is_active')])
        activation_stats = {
            'total': len(activations),
            'active': active_count,
            'inactive': len(activations) - active_count
        }

        missing_credentials = 0
        recent_executions = []
        for activation in activations:
            workflow_meta = activation.get('workflows') or {}
            required_services = parse_required_services(workflow_meta.get('required_services'))
            activation['required_services_list'] = required_services

            api_keys = db.get_workflow_api_keys(activation['id'])
            key_types = { (key.get('service_type') or '').lower() for key in api_keys }
            missing = [service for service in required_services if service.lower() not in key_types]
            activation['missing_services'] = missing
            if missing:
                missing_credentials += 1

            latest_exec = db.get_workflow_executions(activation['id'], limit=1)
            if latest_exec:
                execution = latest_exec[0]
                execution['workflow'] = workflow_meta
                recent_executions.append(execution)

        recent_executions.sort(key=lambda item: item.get('started_at', ''), reverse=True)
        recent_executions = recent_executions[:5]

        # Get company users
        company_users = db.get_company_users(company['id'])
        dashboard_summary = {
            'team_members': len(company_users),
            'active_workflows': activation_stats['active'],
            'pending_workflows': activation_stats['inactive'],
            'missing_credentials': missing_credentials
        }
        
        return render_template('company/dashboard.html',
                             user=user,
                             company=company,
                             activation_stats=activation_stats,
                             dashboard_summary=dashboard_summary,
                             recent_executions=recent_executions,
                             admin_viewing_mode=admin_viewing_mode,
                             company_users=company_users)
    except Exception as e:
        print(f"CEO dashboard error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/company/workflows')
@auth.ceo_required
def company_workflows():
    """CEO workflows page - activate workflows for company"""
    try:
        user = auth.current_user()
        company = db.get_company_by_id(user.get('company_id'))
        if not company:
            return "No company assigned", 403
        
        # Get all public workflows
        workflows = db.get_workflows(public_only=True)
        
        # Get company activations
        activations = db.get_company_activations(company['id'])
        activation_map = {act.get('workflow_id'): act for act in activations}
        activation_keys = {}
        for activation in activations:
            activation_keys[activation['id']] = db.get_workflow_api_keys(activation['id'])
        
        # Mark activated workflows
        for workflow in workflows:
            required_services = parse_required_services(workflow.get('required_services'))
            workflow['required_services_list'] = required_services
            workflow['is_activated'] = workflow['id'] in activation_map
            workflow['activation'] = None
            workflow['is_ready'] = False
            if workflow['is_activated']:
                activation = activation_map[workflow['id']]
                keys = activation_keys.get(activation['id'], [])
                key_types = { (key.get('service_type') or '').lower() for key in keys }
                missing = [service for service in required_services if service.lower() not in key_types]
                activation['missing_services'] = missing
                activation['api_keys'] = keys
                workflow['activation'] = activation
                workflow['is_ready'] = activation.get('is_active') and not missing
        
        return render_template('company/workflows.html',
                             user=user,
                             company=company,
                             workflows=workflows)
    except Exception as e:
        print(f"CEO workflows error: {str(e)}")
        return redirect(url_for('company_dashboard'))

@app.route('/company/workflows/<workflow_id>')
@auth.ceo_required
def company_workflow_detail(workflow_id):
    """CEO workflow detail - configure API keys for company"""
    try:
        user = auth.current_user()
        company = db.get_company_by_id(user.get('company_id'))
        if not company:
            return "No company assigned", 403
        
        workflow = db.get_workflow_by_id(workflow_id)
        if not workflow or not workflow.get('is_public'):
            return redirect(url_for('company_workflows'))
        
        # Get company activation
        activation = None
        api_keys = []
        executions = []
        
        for act in db.get_company_activations(company['id']):
            if act.get('workflow_id') == workflow_id:
                activation = act
                api_keys = db.get_workflow_api_keys(act['id'])
                executions = db.get_workflow_executions(act['id'], limit=20)
                break
        
        required_services = parse_required_services(workflow.get('required_services'))
        workflow['required_services_list'] = required_services
        missing_services = []
        if activation:
            key_types = { (key.get('service_type') or '').lower() for key in api_keys }
            missing_services = [service for service in required_services if service.lower() not in key_types]
            activation['missing_services'] = missing_services
        
        return render_template('company/workflow-detail.html',
                             user=user,
                             company=company,
                             workflow=workflow,
                             activation=activation,
                             api_keys=api_keys,
                             executions=executions,
                             required_services=required_services,
                             missing_services=missing_services)
    except Exception as e:
        print(f"CEO workflow detail error: {str(e)}")
        return redirect(url_for('company_workflows'))

@app.route('/company/workers')
@auth.ceo_required
def company_workers():
    """CEO workers management page"""
    try:
        user = auth.current_user()
        company = db.get_company_by_id(user.get('company_id'))
        if not company:
            return "No company assigned", 403
        
        workers = db.get_company_users(company['id'])
        role_counter = Counter((worker.get('role') or 'worker').lower() for worker in workers)
        password_pending = sum(1 for worker in workers if not worker.get('is_password_set'))
        worker_stats = {
            'total': len(workers),
            'ceos': role_counter.get('ceo', 0),
            'admins': role_counter.get('admin', 0),
            'workers': role_counter.get('worker', 0) + role_counter.get('user', 0),
            'password_pending': password_pending
        }
        
        return render_template('company/workers.html',
                             user=user,
                             company=company,
                             workers=workers,
                             worker_stats=worker_stats)
    except Exception as e:
        print(f"CEO workers error: {str(e)}")
        return redirect(url_for('company_dashboard'))

@app.route('/company/settings')
@auth.ceo_required
def company_settings():
    """CEO company settings page"""
    try:
        user = auth.current_user()
        company = db.get_company_by_id(user.get('company_id'))
        if not company:
            return "No company assigned", 403
        
        return render_template('company/settings.html',
                             user=user,
                             company=company)
    except Exception as e:
        print(f"CEO settings error: {str(e)}")
        return redirect(url_for('company_dashboard'))

# ============================================================================
# WORKER DASHBOARD ROUTES
# ============================================================================

@app.route('/dashboard')
@auth.login_required
def dashboard():
    """Redirect to dashboard overview or admin panel for admins"""
    user = auth.current_user()
    if user and auth.is_admin(user):
        return redirect(url_for('admin_dashboard'))
    return redirect(url_for('dashboard_overview'))

# Dashboard Routes
@app.route('/dashboard/overview')
@auth.login_required
def dashboard_overview():
    """Dashboard overview page"""
    try:
        user = auth.current_user()
        # Redirect admins to admin panel
        if user and auth.is_admin(user):
            return redirect(url_for('admin_dashboard'))
        api_keys = db.get_api_keys(user['id'])
        
        # Get user's activated workflows
        activations = db.get_user_workflow_activations(user['id'])
        active_workflows = [a for a in activations if a.get('is_active')]
        
        # Get recent executions
        recent_executions = []
        for activation in active_workflows[:5]:  # Top 5 workflows
            execs = db.get_workflow_executions(activation['id'], limit=5)
            recent_executions.extend(execs)
        recent_executions.sort(key=lambda x: x.get('started_at', ''), reverse=True)
        recent_executions = recent_executions[:10]
        
        return render_template('dashboard/overview.html', 
                             user=user,
                             active_workflows_count=len(active_workflows),
                             api_keys_count=len(api_keys),
                             integrations_count=0,
                             recent_activity_count=len(recent_executions),
                             recent_workflows=active_workflows[:5])
    except Exception as e:
        print(f"Dashboard overview error: {str(e)}")
        return redirect(url_for('register'))

@app.route('/dashboard/workflows')
@auth.login_required
def dashboard_workflows():
    """Workflows list page - shows only public, available workflows"""
    try:
        user = auth.current_user()
        # Get public workflows only (non-admins see only public)
        is_admin_user = auth.is_admin(user)
        can_view_private = is_admin_user or auth.is_ceo(user)
        workflows = db.get_workflows(public_only=not can_view_private)
        
        # Get user's activations
        activations = db.get_user_workflow_activations(user['id'])
        activation_map = {act.get('workflow_id'): act for act in activations if act.get('workflows')}
        
        # Mark which workflows are activated
        for workflow in workflows:
            workflow['is_activated'] = workflow['id'] in activation_map
            if workflow['is_activated']:
                workflow['activation'] = activation_map[workflow['id']]
        
        return render_template('dashboard/workflows.html', 
                             user=user, 
                             workflows=workflows,
                             is_admin=is_admin_user,
                             can_view_private=can_view_private)
    except Exception as e:
        print(f"Dashboard workflows error: {str(e)}")
        return redirect(url_for('login'))

# Removed dashboard_workflow_create - users can't create workflows, only activate them

@app.route('/dashboard/workflows/<workflow_id>')
@auth.login_required
def dashboard_workflow_detail(workflow_id):
    """Workflow detail page - activation and API key configuration"""
    try:
        user = auth.current_user()
        workflow = db.get_workflow_by_id(workflow_id)
        if not workflow:
            return redirect(url_for('dashboard_workflows'))
        
        # Check if user can access this workflow (must be public or admin)
        is_admin_user = auth.is_admin(user)
        can_view_private = is_admin_user or auth.is_ceo(user)
        if not workflow.get('is_public') and not can_view_private:
            return redirect(url_for('dashboard_workflows'))
        
        # Get user's activation
        activation = db.get_workflow_activation(user['id'], workflow_id)
        api_keys = []
        executions = []
        
        if activation:
            api_keys = db.get_workflow_api_keys(activation['id'])
            executions = db.get_workflow_executions(activation['id'], limit=20)
        
        required_services = workflow.get('required_services', [])
        if isinstance(required_services, str):
            import json
            required_services = json.loads(required_services) if required_services else []
        
        return render_template('dashboard/workflow-detail.html', 
                             user=user, 
                             workflow=workflow,
                             activation=activation,
                             api_keys=api_keys,
                             executions=executions,
                             required_services=required_services,
                             can_view_private=can_view_private,
                             is_admin=is_admin_user)
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
    """Integrations management page - n8n removed (admin-only now)"""
    try:
        user = auth.current_user()
        # n8n is now admin-only, removed from user dashboard
        
        notion_integration = db.get_integration(user['id'], 'notion')
        notion_connected = notion_integration is not None and notion_integration.get('is_active', False)
        
        openai_keys = [k for k in db.get_api_keys(user['id']) if k.get('type', '').lower() == 'openai']
        openai_connected = len(openai_keys) > 0
        
        return render_template('dashboard/integrations.html', 
                             user=user,
                             n8n_connected=False,  # Always False for users
                             n8n_instance_url=None,
                             notion_connected=notion_connected,
                             openai_connected=openai_connected)
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

# ============================================================================
# ADMIN PANEL ROUTES
# ============================================================================

@app.route('/admin')
@auth.admin_required
def admin_dashboard():
    """Admin dashboard - redirect to workflows"""
    return redirect(url_for('admin_workflows'))

@app.route('/admin/workflows')
@auth.admin_required
def admin_workflows():
    """Admin workflow management page"""
    try:
        user = auth.current_user()
        n8n_service = get_n8n_service()
        n8n_configured = n8n_service.is_configured()
        n8n_status = None
        if n8n_configured:
            connected, message = n8n_service.test_connection()
            n8n_status = {'connected': connected, 'message': message}
        
        workflows = db.get_workflows(public_only=False)
        total_workflows = len(workflows)
        active_workflows = sum(1 for w in workflows if w.get('is_active'))
        public_workflows = sum(1 for w in workflows if w.get('is_public'))
        inactive_workflows = total_workflows - active_workflows
        private_workflows = total_workflows - public_workflows
        synced_workflows = sum(1 for w in workflows if w.get('n8n_workflow_id'))

        category_counter = Counter()
        service_counter = Counter()
        last_updated_at = None

        for workflow in workflows:
            category = workflow.get('category') or 'Uncategorized'
            category_counter[category] += 1

            services = parse_required_services(workflow.get('required_services'))
            workflow['required_services_list'] = services
            for service in services:
                service_counter[service] += 1

            candidate_ts = parse_iso_ts(workflow.get('updated_at') or workflow.get('created_at'))
            if candidate_ts and (last_updated_at is None or candidate_ts > last_updated_at):
                last_updated_at = candidate_ts

        workflow_stats = {
            'total': total_workflows,
            'active': active_workflows,
            'inactive': inactive_workflows,
            'public': public_workflows,
            'private': private_workflows,
            'categories': category_counter.most_common(),
            'services': service_counter.most_common(),
            'last_updated': last_updated_at,
            'synced_workflows': synced_workflows
        }

        return render_template('admin/workflows.html',
                             user=user,
                             workflows=workflows,
                             n8n_configured=n8n_configured,
                             n8n_status=n8n_status,
                             workflow_stats=workflow_stats)
    except Exception as e:
        print(f"Admin workflows error: {str(e)}")
        return redirect(url_for('dashboard'))

@app.route('/admin/workflows/<workflow_id>')
@auth.admin_required
def admin_workflow_detail(workflow_id):
    """Admin workflow detail page"""
    try:
        user = auth.current_user()
        workflow = db.get_workflow_by_id(workflow_id)
        if not workflow:
            return redirect(url_for('admin_workflows'))
        
        # Get all executions for this workflow
        executions = db.get_all_workflow_executions(workflow_id=workflow_id, limit=100)
        
        return render_template('admin/workflow-detail.html',
                             user=user,
                             workflow=workflow,
                             executions=executions)
    except Exception as e:
        print(f"Admin workflow detail error: {str(e)}")
        return redirect(url_for('admin_workflows'))

@app.route('/admin/users')
@auth.admin_required
def admin_users():
    """Admin user management page"""
    try:
        user = auth.current_user()
        # Get all users
        all_users = db.get_all_users()
        companies = db.get_companies()

        company_lookup = {company['id']: company for company in companies}
        role_counter = Counter()
        assigned_count = 0
        password_set_count = 0
        last_created_at = None

        enriched_users = []
        for entry in all_users:
            role = entry.get('role') or 'user'
            role_counter[role] += 1
            if entry.get('company_id'):
                assigned_count += 1
                company = company_lookup.get(entry['company_id'])
                if company:
                    entry['company_name'] = company.get('name')
            password_set_count += 1 if entry.get('is_password_set') else 0
            created_ts = parse_iso_ts(entry.get('created_at'))
            if created_ts and (last_created_at is None or created_ts > last_created_at):
                last_created_at = created_ts
            enriched_users.append(entry)

        total_users = len(enriched_users)
        user_stats = {
            'total': total_users,
            'with_password': password_set_count,
            'without_password': total_users - password_set_count,
            'assigned_companies': assigned_count,
            'unassigned': total_users - assigned_count,
            'role_counts': role_counter.most_common(),
            'last_created': last_created_at
        }

        return render_template('admin/users.html',
                             user=user,
                             users=enriched_users,
                             user_stats=user_stats,
                             companies=companies)
    except Exception as e:
        print(f"Admin users error: {str(e)}")
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/users/<user_id>')
@auth.admin_required
def admin_user_detail(user_id):
    """Admin user detail page"""
    try:
        user = auth.current_user()
        target_user = db.get_user_by_id(user_id)
        if not target_user:
            return redirect(url_for('admin_users'))
        
        # Get user's workflow activations
        activations = db.get_user_workflow_activations(user_id)
        
        return render_template('admin/user-detail.html',
                             user=user,
                             target_user=target_user,
                             activations=activations)
    except Exception as e:
        print(f"Admin user detail error: {str(e)}")
        return redirect(url_for('admin_users'))

@app.route('/admin/system')
@auth.admin_required
def admin_system():
    """Admin system status page"""
    try:
        user = auth.current_user()
        n8n_service = get_n8n_service()
        n8n_configured = n8n_service.is_configured()
        n8n_status = None
        if n8n_configured:
            connected, message = n8n_service.test_connection()
            n8n_status = {'connected': connected, 'message': message, 'url': n8n_service.base_url}
        
        # Get system stats
        workflows = db.get_workflows(public_only=False)
        total_workflows = len(workflows)
        public_workflows = sum(1 for w in workflows if w.get('is_public'))
        active_workflows = sum(1 for w in workflows if w.get('is_active'))

        companies = db.get_companies()
        all_users = db.get_all_users()
        activations = db.get_all_workflow_activations()
        executions = db.get_all_workflow_executions(limit=200)

        role_counts = Counter((u.get('role') or 'user') for u in all_users)
        last_execution = executions[0] if executions else None
        last_execution_started_at = parse_iso_ts(last_execution.get('started_at')) if last_execution else None

        system_stats = {
            'total_workflows': total_workflows,
            'active_workflows': active_workflows,
            'inactive_workflows': total_workflows - active_workflows,
            'public_workflows': public_workflows,
            'private_workflows': total_workflows - public_workflows,
            'companies': len(companies),
            'users': len(all_users),
            'admins': role_counts.get('admin', 0),
            'ceos': role_counts.get('ceo', 0),
            'workers': role_counts.get('worker', 0) + role_counts.get('user', 0),
            'activations': len(activations),
            'active_activations': sum(1 for act in activations if act.get('is_active')),
            'executions': len(executions),
            'last_execution_at': last_execution_started_at
        }
        
        return render_template('admin/system.html',
                             user=user,
                             n8n_configured=n8n_configured,
                             n8n_status=n8n_status,
                             system_stats=system_stats)
    except Exception as e:
        print(f"Admin system error: {str(e)}")
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/analytics')
@auth.admin_required
def admin_analytics():
    """Admin system-wide analytics page"""
    try:
        user = auth.current_user()
        # Get system-wide stats
        all_executions = db.get_all_workflow_executions(limit=1000)
        users = db.get_all_users()
        user_lookup = {u['id']: u['name'] for u in users}

        total_executions = len(all_executions)
        success_count = 0
        error_count = 0
        running_count = 0
        duration_values = []
        workflow_counter = Counter()

        for execution in all_executions:
            status = (execution.get('status') or '').lower()
            if status == 'success':
                success_count += 1
            elif status == 'error':
                error_count += 1
            elif status == 'running':
                running_count += 1

            duration = execution.get('duration_ms')
            if isinstance(duration, (int, float)) and duration >= 0:
                duration_values.append(duration)

            workflow_meta = execution.get('workflow_activations', {}).get('workflows', {})
            workflow_id = workflow_meta.get('id') or execution.get('workflow_activation_id')
            workflow_name = workflow_meta.get('name') or 'Unknown Workflow'
            workflow_counter[(workflow_id, workflow_name)] += 1

        avg_duration = None
        if duration_values:
            try:
                avg_duration = statistics.mean(duration_values)
            except statistics.StatisticsError:
                avg_duration = None

        success_rate = (success_count / total_executions * 100) if total_executions else 0
        failure_rate = (error_count / total_executions * 100) if total_executions else 0

        top_workflows = [
            {'workflow_id': wf_id, 'name': name, 'runs': count}
            for (wf_id, name), count in workflow_counter.most_common(10)
        ]

        recent_failures = [exec_item for exec_item in all_executions if (exec_item.get('status') or '').lower() == 'error'][:5]

        execution_stats = {
            'total': total_executions,
            'success': success_count,
            'failed': error_count,
            'running': running_count,
            'avg_duration': avg_duration,
            'success_rate': success_rate,
            'failure_rate': failure_rate
        }
        
        return render_template('admin/analytics.html',
                             user=user,
                             executions=all_executions,
                             execution_stats=execution_stats,
                             top_workflows=top_workflows,
                             recent_failures=recent_failures,
                             user_lookup=user_lookup)
    except Exception as e:
        print(f"Admin analytics error: {str(e)}")
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/companies')
@auth.admin_required
def admin_companies():
    """Admin companies management page"""
    try:
        user = auth.current_user()
        companies = db.get_companies()
        all_users = db.get_all_users()
        activations = db.get_all_workflow_activations()

        user_summary = defaultdict(lambda: {'total': 0, 'admins': 0, 'ceos': 0, 'workers': 0})
        for entry in all_users:
            company_id = entry.get('company_id')
            if not company_id:
                continue
            summary = user_summary[company_id]
            summary['total'] += 1
            role = (entry.get('role') or 'worker').lower()
            if role == 'admin':
                summary['admins'] += 1
            elif role == 'ceo':
                summary['ceos'] += 1
            else:
                summary['workers'] += 1

        activation_summary = defaultdict(lambda: {'total': 0, 'active': 0, 'last_updated': None})
        for activation in activations:
            company_id = activation.get('company_id')
            if not company_id:
                continue
            summary = activation_summary[company_id]
            summary['total'] += 1
            if activation.get('is_active'):
                summary['active'] += 1
            ts = parse_iso_ts(activation.get('updated_at') or activation.get('created_at'))
            if ts and (summary['last_updated'] is None or ts > summary['last_updated']):
                summary['last_updated'] = ts

        enriched_companies = []
        for company in companies:
            cid = company.get('id')
            company_stats = user_summary.get(cid, {'total': 0, 'admins': 0, 'ceos': 0, 'workers': 0})
            activation_stats = activation_summary.get(cid, {'total': 0, 'active': 0, 'last_updated': None})
            company['user_stats'] = company_stats
            company['activation_stats'] = activation_stats
            enriched_companies.append(company)

        total_companies = len(enriched_companies)
        companies_with_active = sum(1 for company in enriched_companies if company['activation_stats']['active'] > 0)
        companies_with_ceo = sum(1 for company in enriched_companies if company['user_stats']['ceos'] > 0)

        company_stats = {
            'total': total_companies,
            'with_active_workflows': companies_with_active,
            'without_active_workflows': total_companies - companies_with_active,
            'with_ceo': companies_with_ceo,
            'without_ceo': total_companies - companies_with_ceo
        }

        return render_template('admin/companies.html',
                             user=user,
                             companies=enriched_companies,
                             company_stats=company_stats)
    except Exception as e:
        print(f"Admin companies error: {str(e)}")
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/companies/<company_id>')
@auth.admin_required
def admin_company_detail(company_id):
    """Admin company detail page"""
    try:
        user = auth.current_user()
        company = db.get_company_by_id(company_id)
        if not company:
            return redirect(url_for('admin_companies'))
        
        company_users = db.get_company_users(company_id)
        company_activations = db.get_company_activations(company_id)

        role_counter = Counter((u.get('role') or 'worker') for u in company_users)
        total_users = len(company_users)
        user_stats = {
            'total': total_users,
            'admins': role_counter.get('admin', 0),
            'ceos': role_counter.get('ceo', 0),
            'workers': role_counter.get('worker', 0) + role_counter.get('user', 0)
        }

        activation_count = len(company_activations)
        active_activation_count = sum(1 for act in company_activations if act.get('is_active'))
        total_execution_count = sum(act.get('execution_count') or 0 for act in company_activations)
        last_activation_update = None
        last_execution_at = None

        for activation in company_activations:
            updated_ts = parse_iso_ts(activation.get('updated_at') or activation.get('created_at'))
            if updated_ts and (last_activation_update is None or updated_ts > last_activation_update):
                last_activation_update = updated_ts
            last_exec = parse_iso_ts(activation.get('last_executed_at'))
            if last_exec and (last_execution_at is None or last_exec > last_execution_at):
                last_execution_at = last_exec

        activation_stats = {
            'total': activation_count,
            'active': active_activation_count,
            'inactive': activation_count - active_activation_count,
            'execution_count': total_execution_count,
            'last_updated': last_activation_update,
            'last_execution': last_execution_at
        }
        
        return render_template('admin/company-detail.html',
                             user=user,
                             company=company,
                             members=company_users,
                             activations=company_activations,
                             user_stats=user_stats,
                             activation_stats=activation_stats)
    except Exception as e:
        print(f"Admin company detail error: {str(e)}")
        return redirect(url_for('admin_companies'))

@app.route('/admin/companies/<company_id>/access')
@auth.admin_required
def admin_access_company(company_id):
    """Admin access company dashboard (View as Company feature)"""
    try:
        user = auth.current_user()
        company = db.get_company_by_id(company_id)
        
        if not company:
            return redirect(url_for('admin_companies'))
        
        # Set admin viewing mode in session
        session['admin_viewing_company_id'] = company_id
        session['admin_viewing_mode'] = True
        session['admin_return_url'] = request.referrer or url_for('admin_companies')
        
        # Redirect to company dashboard
        return redirect(url_for('company_dashboard'))
    except Exception as e:
        print(f"Admin access company error: {str(e)}")
        return redirect(url_for('admin_companies'))

@app.route('/admin/exit-company-view')
@auth.admin_required
def admin_exit_company_view():
    """Exit admin company viewing mode"""
    return_url = session.get('admin_return_url', url_for('admin_companies'))
    session.pop('admin_viewing_company_id', None)
    session.pop('admin_viewing_mode', None)
    session.pop('admin_return_url', None)
    return redirect(return_url)

@app.route('/admin/n8n')
@auth.admin_required
def admin_n8n():
    """Admin n8n access page"""
    try:
        user = auth.current_user()
        n8n_service = get_n8n_service()
        n8n_configured = n8n_service.is_configured()
        n8n_url = n8n_service.base_url if n8n_configured else None
        n8n_status = None
        
        # Try to read saved ngrok URL from file (if start script was run)
        saved_ngrok_url = None
        try:
            ngrok_url_file = '/tmp/ngrok-n8n.url'
            if os.path.exists(ngrok_url_file):
                with open(ngrok_url_file, 'r') as f:
                    saved_ngrok_url = f.read().strip()
        except Exception:
            pass  # Ignore errors reading the file
        
        workflows = db.get_workflows(public_only=False)
        total_workflows = len(workflows)
        n8n_synced = sum(1 for w in workflows if w.get('n8n_workflow_id'))
        last_sync = None
        for workflow in workflows:
            updated_ts = parse_iso_ts(workflow.get('updated_at') or workflow.get('created_at'))
            if updated_ts and (last_sync is None or updated_ts > last_sync):
                last_sync = updated_ts
        n8n_overview = {
            'total_workflows': total_workflows,
            'synced_workflows': n8n_synced,
            'unsynced_workflows': total_workflows - n8n_synced,
            'last_synced_at': last_sync
        }
        
        if n8n_configured:
            connected, message = n8n_service.test_connection()
            n8n_status = {'connected': connected, 'message': message}
        
        return render_template('admin/n8n.html',
                             user=user,
                             n8n_configured=n8n_configured,
                             n8n_url=n8n_url,
                             n8n_status=n8n_status,
                             n8n_overview=n8n_overview,
                             saved_ngrok_url=saved_ngrok_url)
    except Exception as e:
        print(f"Admin n8n error: {str(e)}")
        return redirect(url_for('admin_dashboard'))

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


@app.route('/dashboard/billing')
@auth.login_required
def dashboard_billing():
    """Billing and subscription page"""
    try:
        user = auth.current_user()
        # Placeholder - to be replaced with actual billing data
        current_plan = {
            'name': 'Free',
            'status': 'active',
            'price': 0,
            'billing_cycle': 'month'
        }
        usage = {
            'workflow_runs': 0,
            'api_calls': 0,
            'team_members': 1
        }
        limits = {
            'workflow_runs': 100,
            'api_calls': 1000,
            'team_members': 3
        }
        usage_percentage = {
            'workflow_runs': 0,
            'api_calls': 0,
            'team_members': 33
        }
        return render_template('dashboard/billing.html', 
                             user=user,
                             current_plan=current_plan,
                             usage=usage,
                             limits=limits,
                             usage_percentage=usage_percentage,
                             payment_method=None,
                             invoices=[])
    except Exception as e:
        print(f"Dashboard billing error: {str(e)}")
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
    company_id = (data.get('company_id') or '').strip() or None
    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters'}), 400
    if role not in ('user', 'admin', 'ceo', 'worker'):
        role = 'user'
    try:
        user = auth.create_user_admin(name, role=role, company_id=company_id)
        response_user = {
            'id': user['id'],
            'name': user['name'],
            'role': user.get('role', 'user'),
            'company_id': user.get('company_id')
        }
        return jsonify({'message': 'User created. They can now set their password on first login.', 'user': response_user})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/init-theo', methods=['POST'])
def api_init_theo():
    """Initialize Theo as Admin - one-time setup endpoint"""
    # This is a special endpoint to initialize Theo
    # Should be secured in production
    try:
        user = auth.create_user_admin('Theo', role='admin')
        return jsonify({
            'message': 'Theo initialized successfully as Admin',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'role': user.get('role', 'admin')
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
        # Determine redirect based on role and company assignment
        role = user.get('role', 'worker')
        company_id = user.get('company_id')
        
        # Admin users always go to admin panel
        if role == 'admin':
            redirect_url = '/admin'
        # CEO/workers with company go to company dashboard
        elif role == 'ceo' and company_id:
            redirect_url = '/company/dashboard'
        elif role == 'worker' and company_id:
            redirect_url = '/company/dashboard'  # Workers also use company dashboard
        # Fallback to personal dashboard
        else:
            redirect_url = '/dashboard'
        
        return jsonify({
            'message': 'Password set successfully',
            'user': {'id': user['id'], 'name': user['name']},
            'redirect': redirect_url
        })
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
        
        # Determine redirect based on role and company assignment
        role = user.get('role', 'worker')
        company_id = user.get('company_id')
        
        # Admin users always go to admin panel
        if role == 'admin':
            redirect_url = '/admin'
        # CEO/workers with company go to company dashboard
        elif role == 'ceo' and company_id:
            redirect_url = '/company/dashboard'
        elif role == 'worker' and company_id:
            redirect_url = '/company/dashboard'  # Workers also use company dashboard
        # Fallback to personal dashboard
        else:
            redirect_url = '/dashboard'
        
        return jsonify({
            'message': 'Logged in', 
            'user': user,
            'redirect': redirect_url
        })
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

# ============================================================================
# ADMIN API ROUTES
# ============================================================================

@app.route('/api/admin/workflows/sync', methods=['POST'])
@auth.admin_required
def api_admin_sync_workflows():
    """Sync workflows from n8n (admin only)"""
    user = auth.current_user()
    n8n_service = get_n8n_service()
    
    if not n8n_service.is_configured():
        return jsonify({'error': 'n8n not configured. Set N8N_URL and N8N_API_KEY environment variables.'}), 400
    
    try:
        # Test connection first
        connected, message = n8n_service.test_connection()
        if not connected:
            return jsonify({'error': message}), 400
        
        # Fetch workflows from n8n
        n8n_workflows = n8n_service.get_workflows()
        synced_count = 0
        
        for n8n_wf in n8n_workflows:
            # Extract required services from workflow nodes
            required_services = []
            nodes = n8n_wf.get('nodes', [])
            for node in nodes:
                node_type = node.get('type', '')
                if 'notion' in node_type.lower():
                    required_services.append('notion')
                elif 'googledocs' in node_type.lower() or 'googlesheets' in node_type.lower():
                    required_services.append('google-docs')
                elif 'openai' in node_type.lower():
                    required_services.append('openai')
            
            # Remove duplicates
            required_services = list(set(required_services))
            
            workflow_data = {
                'n8n_workflow_id': n8n_wf.get('id'),
                'name': n8n_wf.get('name', 'Unnamed Workflow'),
                'description': n8n_wf.get('settings', {}).get('executionOrder', ''),
                'category': n8n_wf.get('tags', [{}])[0].get('name', 'automation') if n8n_wf.get('tags') else 'automation',
                'required_services': required_services,
                'metadata': n8n_wf,
                'created_by': user['id'],
                'is_active': True,
                'is_public': False  # Default to private, admin can make public
            }
            
            db.create_or_update_workflow(workflow_data)
            synced_count += 1
        
        return jsonify({
            'message': f'Synced {synced_count} workflows successfully',
            'synced_count': synced_count
        })
    except Exception as e:
        print(f"Error syncing workflows: {e}")
        return jsonify({'error': f'Sync failed: {str(e)}'}), 400

@app.route('/api/admin/workflows/<workflow_id>/toggle', methods=['PUT'])
@auth.admin_required
def api_admin_toggle_workflow(workflow_id):
    """Enable/disable workflow (admin only)"""
    user = auth.current_user()
    workflow = db.get_workflow_by_id(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404
    
    data = request.get_json() or {}
    is_active = data.get('is_active', not workflow.get('is_active', False))
    
    success = db.update_workflow(workflow_id, {'is_active': is_active})
    if success:
        return jsonify({'message': f'Workflow {"enabled" if is_active else "disabled"}', 'is_active': is_active})
    else:
        return jsonify({'error': 'Failed to update workflow'}), 400

@app.route('/api/admin/workflows/<workflow_id>/public', methods=['PUT'])
@auth.admin_required
def api_admin_toggle_workflow_public(workflow_id):
    """Make workflow public/private (admin only)"""
    user = auth.current_user()
    workflow = db.get_workflow_by_id(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404
    
    data = request.get_json() or {}
    is_public = data.get('is_public', not workflow.get('is_public', False))
    
    success = db.update_workflow(workflow_id, {'is_public': is_public})
    if success:
        return jsonify({'message': f'Workflow made {"public" if is_public else "private"}', 'is_public': is_public})
    else:
        return jsonify({'error': 'Failed to update workflow'}), 400

@app.route('/api/admin/workflows/<workflow_id>/executions', methods=['GET'])
@auth.admin_required
def api_admin_get_workflow_executions(workflow_id):
    """Get all executions for a workflow (admin only)"""
    user = auth.current_user()
    executions = db.get_all_workflow_executions(workflow_id=workflow_id, limit=100)
    return jsonify(executions)

@app.route('/api/admin/workflows/<workflow_id>/execute', methods=['POST'])
@auth.admin_required
def api_admin_execute_workflow(workflow_id):
    """Manually trigger workflow execution (admin only)"""
    user = auth.current_user()
    workflow = db.get_workflow_by_id(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404
    
    n8n_service = get_n8n_service()
    if not n8n_service.is_configured():
        return jsonify({'error': 'n8n not configured'}), 400
    
    data = request.get_json() or {}
    input_data = data.get('data', {})
    
    try:
        result = n8n_service.execute_workflow(workflow['n8n_workflow_id'], input_data)
        if result and 'error' in result:
            return jsonify({'error': result['error']}), 400
        return jsonify({'message': 'Workflow executed', 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/users', methods=['GET'])
@auth.admin_required
def api_admin_list_users():
    """List all users (admin only)"""
    users = db.get_all_users()
    return jsonify(users)

@app.route('/api/admin/users', methods=['POST'])
@auth.admin_required
def api_admin_create_user():
    """Create new user (admin only)"""
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    role = (data.get('role') or 'user').strip()
    company_id = (data.get('company_id') or '').strip() or None
    
    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters'}), 400
    if role not in ('user', 'admin', 'ceo', 'worker'):
        role = 'user'
    
    try:
        user = auth.create_user_admin(name, role=role, company_id=company_id)
        return jsonify({'message': 'User created', 'user': {'id': user['id'], 'name': user['name'], 'role': user.get('role', 'user'), 'company_id': user.get('company_id')}})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/users/<user_id>', methods=['PUT'])
@auth.admin_required
def api_admin_update_user(user_id):
    """Update user (admin only)"""
    data = request.get_json() or {}
    role_update = None
    updated = False
    
    if 'role' in data:
        role = (data['role'] or '').strip()
        if role in ('user', 'admin', 'ceo', 'worker'):
            role_update = role
            if db.update_user_role(user_id, role_update):
                updated = True
    
    if 'company_id' in data:
        company_id = (data.get('company_id') or '').strip()
        company_id = company_id or None
        if db.assign_user_to_company(user_id, company_id):
            updated = True
    
    if updated:
        return jsonify({'message': 'User updated'})
    
    return jsonify({'error': 'No valid updates'}), 400

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@auth.admin_required
def api_admin_delete_user(user_id):
    """Delete user (admin only)"""
    # Note: This would require a delete_user function in db.py
    # For now, return error
    return jsonify({'error': 'User deletion not yet implemented'}), 501

@app.route('/api/admin/users/<user_id>/activations', methods=['GET'])
@auth.admin_required
def api_admin_get_user_activations(user_id):
    """Get user's workflow activations (admin only)"""
    activations = db.get_user_workflow_activations(user_id)
    return jsonify(activations)

# Admin Company API Routes
@app.route('/api/admin/companies', methods=['GET'])
@auth.admin_required
def api_admin_list_companies():
    """List all companies (admin only)"""
    companies = db.get_companies()
    return jsonify(companies)

@app.route('/api/admin/companies', methods=['POST'])
@auth.admin_required
def api_admin_create_company():
    """Create a new company (admin only)"""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    slug = data.get('slug', '').strip().lower()
    settings = data.get('settings', {})
    
    if not name or not slug:
        return jsonify({'error': 'Name and slug required'}), 400
    
    try:
        company = db.create_company(name, slug, settings)
        return jsonify({'message': 'Company created', 'company': company})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/companies/<company_id>', methods=['PUT'])
@auth.admin_required
def api_admin_update_company(company_id):
    """Update company (admin only)"""
    data = request.get_json() or {}
    updates = {}
    
    if 'name' in data:
        updates['name'] = data['name'].strip()
    if 'settings' in data:
        updates['settings'] = data['settings']
    
    if updates:
        success = db.update_company(company_id, updates)
        if success:
            return jsonify({'message': 'Company updated'})
    
    return jsonify({'error': 'No valid updates'}), 400

@app.route('/api/admin/companies/<company_id>', methods=['DELETE'])
@auth.admin_required
def api_admin_delete_company(company_id):
    """Delete company (admin only)"""
    success = db.delete_company(company_id)
    if success:
        return jsonify({'message': 'Company deleted'})
    return jsonify({'error': 'Failed to delete company'}), 500

@app.route('/api/admin/companies/<company_id>/assign-ceo', methods=['POST'])
@auth.admin_required
def api_admin_assign_ceo(company_id):
    """Assign a user as CEO to a company (admin only)"""
    data = request.get_json() or {}
    user_name = data.get('user_name', '').strip()
    
    if not user_name:
        return jsonify({'error': 'User name required'}), 400
    
    try:
        # Create or get user with CEO role
        user = auth.create_user_admin(user_name, role='ceo', company_id=company_id)
        return jsonify({'message': 'CEO assigned', 'user': user})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/companies/<company_id>/users', methods=['GET'])
@auth.admin_required
def api_admin_get_company_users(company_id):
    """Get company users (admin only)"""
    users = db.get_company_users(company_id)
    return jsonify(users)

@app.route('/api/admin/companies/<company_id>/members', methods=['POST'])
@auth.admin_required
def api_admin_add_company_member(company_id):
    """Add a member to a company (admin only)"""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    role = data.get('role', 'worker').strip()
    
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    if role not in ['ceo', 'worker']:
        return jsonify({'error': 'Invalid role. Must be ceo or worker'}), 400
    
    try:
        # Check if user exists
        existing_user = db.get_user_by_name(name)
        
        if existing_user:
            # Assign existing user to company
            success = db.assign_user_to_company(existing_user['id'], company_id, role)
            if success:
                return jsonify({'success': True, 'user_id': existing_user['id'], 'message': 'User assigned to company'}), 200
            else:
                return jsonify({'error': 'Failed to assign user to company'}), 500
        else:
            # Create new user and assign to company
            new_user = auth.create_user_admin(name, role=role, company_id=company_id)
            if new_user:
                return jsonify({'success': True, 'user_id': new_user['id'], 'message': 'User created and assigned to company'}), 201
            else:
                return jsonify({'error': 'Failed to create user'}), 500
    except Exception as e:
        app.logger.error(f"Error adding company member: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# CEO API ROUTES
# ============================================================================

@app.route('/api/company/workflows/<workflow_id>/activate', methods=['POST'])
@auth.ceo_required
def api_company_activate_workflow(workflow_id):
    """Activate workflow for company (CEO only)"""
    user = auth.current_user()
    company_id = user.get('company_id')
    
    if not company_id:
        return jsonify({'error': 'No company assigned'}), 403
    
    try:
        # Activate workflow for company (not individual user)
        activation = db.activate_workflow(company_id, workflow_id, is_company_level=True)
        return jsonify({'message': 'Workflow activated for company', 'activation': activation})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/company/workflows/<workflow_id>/deactivate', methods=['DELETE'])
@auth.ceo_required
def api_company_deactivate_workflow(workflow_id):
    """Deactivate workflow for company (CEO only)"""
    user = auth.current_user()
    company_id = user.get('company_id')
    
    if not company_id:
        return jsonify({'error': 'No company assigned'}), 403
    
    try:
        success = db.deactivate_workflow(company_id, workflow_id, is_company_level=True)
        if success:
            return jsonify({'message': 'Workflow deactivated for company'})
        return jsonify({'error': 'Failed to deactivate'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/company/workflows/<workflow_id>/api-keys', methods=['POST'])
@auth.ceo_required
def api_company_set_workflow_api_key(workflow_id):
    """Set API key for company workflow (CEO only)"""
    user = auth.current_user()
    company_id = user.get('company_id')
    
    if not company_id:
        return jsonify({'error': 'No company assigned'}), 403
    
    data = request.get_json() or {}
    service_type = data.get('service_type', '').strip().lower()
    api_key = data.get('api_key', '').strip()
    
    if not service_type or not api_key:
        return jsonify({'error': 'service_type and api_key required'}), 400
    
    try:
        # Find company activation
        activations = db.get_company_activations(company_id)
        activation = next((a for a in activations if a.get('workflow_id') == workflow_id), None)
        
        if not activation:
            return jsonify({'error': 'Workflow not activated for company'}), 400
        
        db.set_workflow_api_key(activation['id'], service_type, api_key)
        return jsonify({'message': 'API key saved'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/company/workers', methods=['POST'])
@auth.ceo_required
def api_company_add_worker():
    """Add worker to company (CEO only)"""
    user = auth.current_user()
    company_id = user.get('company_id')
    
    if not company_id:
        return jsonify({'error': 'No company assigned'}), 403
    
    data = request.get_json() or {}
    worker_name = data.get('name', '').strip()
    
    if not worker_name:
        return jsonify({'error': 'Worker name required'}), 400
    
    try:
        worker = auth.create_user_admin(worker_name, role='worker', company_id=company_id)
        return jsonify({'message': 'Worker added', 'worker': worker})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/company/settings', methods=['PUT'])
@auth.ceo_required
def api_company_update_settings():
    """Update company settings (CEO only)"""
    user = auth.current_user()
    company_id = user.get('company_id')
    
    if not company_id:
        return jsonify({'error': 'No company assigned'}), 403
    
    data = request.get_json() or {}
    updates = {}
    
    if 'name' in data:
        updates['name'] = data['name'].strip()
    if 'settings' in data:
        updates['settings'] = data['settings']
    
    if updates:
        success = db.update_company(company_id, updates)
        if success:
            return jsonify({'message': 'Company settings updated'})
    
    return jsonify({'error': 'No valid updates'}), 400

# ============================================================================
# USER API ROUTES
# ============================================================================

@app.route('/api/workflows', methods=['GET'])
@auth.login_required
def api_list_workflows():
    """List available workflows (public only for non-admins)"""
    user = auth.current_user()
    can_view_private = auth.is_admin(user) or auth.is_ceo(user)
    workflows = db.get_workflows(public_only=not can_view_private)
    return jsonify(workflows)

@app.route('/api/workflows/<workflow_id>', methods=['GET'])
@auth.login_required
def api_get_workflow(workflow_id):
    """Get workflow details"""
    user = auth.current_user()
    workflow = db.get_workflow_by_id(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404
    
    # Check access
    can_view_private = auth.is_admin(user) or auth.is_ceo(user)
    if not workflow.get('is_public') and not can_view_private:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(workflow)

@app.route('/api/workflows/<workflow_id>/activate', methods=['POST'])
@auth.login_required
def api_activate_workflow(workflow_id):
    """Activate a workflow for the current user"""
    user = auth.current_user()
    workflow = db.get_workflow_by_id(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404
    
    # Check if workflow is available
    can_view_private = auth.is_admin(user) or auth.is_ceo(user)
    if not workflow.get('is_public') and not can_view_private:
        return jsonify({'error': 'Workflow not available'}), 403
    
    if not workflow.get('is_active'):
        return jsonify({'error': 'Workflow is disabled'}), 400
    
    data = request.get_json() or {}
    config = data.get('config', {})
    
    try:
        activation = db.activate_workflow(user['id'], workflow_id, config)
        return jsonify({'message': 'Workflow activated', 'activation': activation})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/workflows/<workflow_id>/deactivate', methods=['DELETE'])
@auth.login_required
def api_deactivate_workflow(workflow_id):
    """Deactivate a workflow for the current user"""
    user = auth.current_user()
    success = db.deactivate_workflow(user['id'], workflow_id)
    if success:
        return jsonify({'message': 'Workflow deactivated'})
    else:
        return jsonify({'error': 'Failed to deactivate workflow'}), 400

@app.route('/api/workflows/<workflow_id>/api-keys', methods=['POST'])
@auth.login_required
def api_set_workflow_api_key(workflow_id):
    """Add/update API key for a workflow service"""
    user = auth.current_user()
    workflow = db.get_workflow_by_id(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404
    
    # Get or create activation
    activation = db.get_workflow_activation(user['id'], workflow_id)
    if not activation:
        activation = db.activate_workflow(user['id'], workflow_id)
    
    data = request.get_json() or {}
    service_type = data.get('service_type', '').strip()
    api_key = data.get('api_key', '').strip()
    config = data.get('config', {})
    
    if not service_type or not api_key:
        return jsonify({'error': 'service_type and api_key are required'}), 400
    
    try:
        key_data = db.set_workflow_api_key(activation['id'], service_type, api_key, config)
        return jsonify({'message': 'API key saved', 'key': {'id': key_data['id'], 'service_type': service_type}})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/workflows/<workflow_id>/executions', methods=['GET'])
@auth.login_required
def api_get_workflow_executions(workflow_id):
    """Get execution history for user's workflow activation"""
    user = auth.current_user()
    activation = db.get_workflow_activation(user['id'], workflow_id)
    if not activation:
        return jsonify({'error': 'Workflow not activated'}), 404
    
    executions = db.get_workflow_executions(activation['id'], limit=50)
    return jsonify(executions)

@app.route('/api/workflows/<workflow_id>/run', methods=['POST'])
@auth.login_required
def api_run_workflow(workflow_id):
    """Trigger workflow execution"""
    user = auth.current_user()
    workflow = db.get_workflow_by_id(workflow_id)
    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404
    
    activation = db.get_workflow_activation(user['id'], workflow_id)
    if not activation or not activation.get('is_active'):
        return jsonify({'error': 'Workflow not activated'}), 400
    
    # Get API keys for this activation
    api_keys = db.get_workflow_api_keys(activation['id'])
    api_key_map = {key['service_type']: key['api_key'] for key in api_keys}
    
    # Check required services
    required_services = workflow.get('required_services', [])
    if isinstance(required_services, str):
        import json
        required_services = json.loads(required_services) if required_services else []
    
    missing_services = [s for s in required_services if s not in api_key_map]
    if missing_services:
        return jsonify({'error': f'Missing API keys for: {", ".join(missing_services)}'}), 400
    
    n8n_service = get_n8n_service()
    if not n8n_service.is_configured():
        return jsonify({'error': 'n8n not configured'}), 400
    
    data = request.get_json() or {}
    input_data = data.get('data', {})
    
    # Add API keys to input data
    input_data['api_keys'] = api_key_map
    
    try:
        # Log execution start
        execution_log = db.log_workflow_execution(activation['id'], {
            'status': 'running',
            'input_data': input_data,
            'started_at': datetime.utcnow().isoformat()
        })
        
        # Execute workflow
        result = n8n_service.execute_workflow(workflow['n8n_workflow_id'], input_data)
        
        # Update execution log
        finished_at = datetime.utcnow()
        try:
            started_at = date_parser.parse(execution_log['started_at'])
        except Exception:
            started_at = datetime.utcnow()
        duration_ms = int((finished_at - started_at.replace(tzinfo=None) if hasattr(started_at, 'replace') else finished_at).total_seconds() * 1000)
        
        status = 'success' if result and 'error' not in result else 'error'
        error_message = result.get('error') if result and 'error' in result else None
        
        # Update the existing execution log instead of creating a new one
        execution_id = execution_log.get('id')
        if execution_id:
            try:
                db_client = db.get_db()
                if db_client is not None:
                    db_client.table('workflow_executions').update({
                        'n8n_execution_id': result.get('executionId') if result else None,
                        'status': status,
                        'output_data': result,
                        'error_message': error_message,
                        'finished_at': finished_at.isoformat(),
                        'duration_ms': duration_ms
                    }).eq('id', execution_id).execute()
                else:
                    # Database not available, try to log as new entry
                    print("Database not available for execution log update, attempting to create new log entry")
                    db.log_workflow_execution(activation['id'], {
                        'n8n_execution_id': result.get('executionId') if result else None,
                        'status': status,
                        'output_data': result,
                        'error_message': error_message,
                        'finished_at': finished_at.isoformat(),
                        'duration_ms': duration_ms
                    })
            except Exception as update_error:
                print(f"Error updating execution log: {update_error}")
                # If update fails, create a new log entry
                try:
                    db.log_workflow_execution(activation['id'], {
                        'n8n_execution_id': result.get('executionId') if result else None,
                        'status': status,
                        'output_data': result,
                        'error_message': error_message,
                        'finished_at': finished_at.isoformat(),
                        'duration_ms': duration_ms
                    })
                except Exception as log_error:
                    print(f"Error logging workflow execution: {log_error}")
                    # Continue even if logging fails
        
        if status == 'error':
            return jsonify({'error': error_message or 'Workflow execution failed'}), 400
        
        return jsonify({'message': 'Workflow executed', 'execution_id': execution_id, 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Integration API Routes
# n8n connection routes removed - n8n is now configured via environment variables (admin-only)

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


# ============================================================================
# Billing API Routes
# ============================================================================

@app.route('/api/billing/portal', methods=['POST'])
@auth.login_required
def api_billing_portal():
    """Generate billing portal URL"""
    user = auth.current_user()
    # Placeholder - to be replaced with actual billing portal generation
    return jsonify({'url': 'https://billing.syntra.app/portal'})

@app.route('/api/billing/upgrade', methods=['POST'])
@auth.login_required
def api_upgrade_plan():
    """Upgrade subscription plan"""
    user = auth.current_user()
    data = request.get_json() or {}
    # Placeholder - to be replaced with actual upgrade logic
    return jsonify({'message': 'Plan upgraded', 'checkout_url': None})

@app.route('/api/billing/downgrade', methods=['POST'])
@auth.login_required
def api_downgrade_plan():
    """Schedule plan downgrade"""
    user = auth.current_user()
    data = request.get_json() or {}
    # Placeholder - to be replaced with actual downgrade logic
    return jsonify({'message': 'Downgrade scheduled'})

@app.route('/api/billing/payment-method/setup', methods=['POST'])
@auth.login_required
def api_setup_payment_method():
    """Setup or update payment method"""
    user = auth.current_user()
    # Placeholder - to be replaced with actual payment setup
    return jsonify({'setup_url': 'https://billing.syntra.app/setup'})

# ============================================================================
# n8n Sync API Routes
# ============================================================================

# Old sync route removed - now use /api/admin/workflows/sync

# Expose app as 'application' for Vercel's Python runtime
application = app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', '5000')), debug=os.getenv('FLASK_DEBUG') == '1')
