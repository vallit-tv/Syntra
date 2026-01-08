"""Main application"""
from datetime import timedelta, datetime, timezone
from collections import Counter, defaultdict
from typing import Optional, Tuple
import analytics_helper
import json
import os
import statistics
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, abort, send_file
from dotenv import load_dotenv
from dateutil import parser as date_parser
import auth
import db


load_dotenv()

# Auto-sync state removed


# Log environment variable status at startup (for Vercel debugging)
print("=" * 60)
print("ENVIRONMENT VARIABLES CHECK (Startup)")
print("=" * 60)
print(f"VERCEL env: {os.getenv('VERCEL')}")
print(f"VERCEL_URL: {os.getenv('VERCEL_URL')}")
print(f"SUPABASE_URL set: {bool(os.getenv('SUPABASE_URL'))}")
print(f"SUPABASE_KEY set: {bool(os.getenv('SUPABASE_KEY'))}")
print(f"SUPABASE_SERVICE_KEY set: {bool(os.getenv('SUPABASE_SERVICE_KEY'))}")

print("=" * 60)

app = Flask(__name__, static_folder='static', static_url_path='/static', template_folder='templates')
# Force redeploy for route fix (Step 1010)

# CRITICAL: Secret key must be stable across deployments on Vercel
# Using a random key on each cold start invalidates all sessions!
# Generate a stable key automatically if not set (based on a constant, not random)
_secret_key = os.getenv('FLASK_SECRET_KEY')
if not _secret_key:
    # Use a stable default key based on a hash (not random) to prevent session invalidation
    # This ensures sessions persist across Vercel cold starts
    import hashlib
    _secret_key = hashlib.sha256(b'SyntraDefaultSecretKey2024').hexdigest()
app.secret_key = _secret_key

# Increase session lifetime for better user experience
app.permanent_session_lifetime = timedelta(days=365)  # 365 days to keep users logged in
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
# On Vercel, always use secure cookies (HTTPS is always used)
# Only use secure cookies in production/vercel, not in local development
app.config['SESSION_COOKIE_SECURE'] = os.getenv('VERCEL') == '1' or (os.getenv('ENV') == 'production' and os.getenv('USE_SECURE_COOKIES', 'false').lower() == 'true')
# Ensure session cookies work across the entire site
app.config['SESSION_COOKIE_PATH'] = '/'
# Set session cookie name explicitly
app.config['SESSION_COOKIE_NAME'] = 'syntra_session'


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


# Static file handling
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
            'message': 'App is running',
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
            'message': 'App is running',
            'database': {
                'connected': False,
                'error': str(e)
            }
        }), 200


# DEV ONLY: Preview dashboard without auth (remove in production)
@app.route('/dev/preview-dashboard')
def dev_preview_dashboard():
    """DEV ONLY: Preview dashboard design without authentication"""
    if os.getenv('VERCEL'):
        abort(404)  # Disable on production
    
    # Create a mock user for testing
    mock_user = {
        'id': 'dev-test-user',
        'name': 'Developer',
        'email': 'dev@vallit.net',
        'role': 'admin'
    }
    
    from datetime import datetime
    now_utc = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
    
    return render_template('console/home.html',
                         user=mock_user,
                         api_keys_count=2,
                         integrations_count=1,
                         now_utc=now_utc)


@app.route('/dev/reset-rate-limit')
def dev_reset_rate_limit():
    """DEV ONLY: Reset rate limit store"""
    if os.getenv('VERCEL'):
        abort(404)
    auth._rate_limit_store.clear()
    return jsonify({'success': True, 'message': 'Rate limit store cleared'})


# Before request handler to ensure sessions are properly handled
@app.before_request
def before_request():
    """Ensure session is properly configured before each request"""
    # Make session permanent if user is logged in
    if session.get('user_id'):
        session.permanent = True
    # Debug: log session state for protected routes
    if request.path.startswith('/dashboard') or request.path.startswith('/admin') or request.path.startswith('/company'):
        print(f"DEBUG: Before request to {request.path} - session['user_id'] = {session.get('user_id')}, session keys: {list(session.keys())}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/features')
def features():
    return render_template('features.html')

@app.route('/features/automation')
def feature_automation():
    return render_template('features/automation.html')

@app.route('/features/analytics')
def feature_analytics():
    return render_template('features/analytics.html')

@app.route('/features/security')
def feature_security():
    return render_template('features/security.html')

@app.route('/pricing')
def pricing():
    return render_template('pricing.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/impressum')
def impressum():
    return render_template('legal/impressum.html')

@app.route('/datenschutz')
def datenschutz():
    return render_template('legal/datenschutz.html')

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

        from datetime import datetime
        now_utc = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
        
        # Check integrations (simple count)
        openai_key = next((k for k in api_keys if k.get('type') == 'OpenAI' and k.get('is_active')), None)
        notion_key = next((k for k in api_keys if k.get('type') == 'Notion' and k.get('is_active')), None)
        integrations_count = int(bool(openai_key)) + int(bool(notion_key))

        return render_template('console/home.html', 
                             user=user,
                             api_keys_count=len(api_keys),
                             integrations_count=integrations_count,
                             now_utc=now_utc)
    except Exception as e:
        print(f"Dashboard overview error: {str(e)}")
        return redirect(url_for('register'))



# ============================================================================
# AUTOMATION ENDPOINTS
# ============================================================================




# Removed dashboard_workflow_create - users can't create workflows, only activate them



@app.route('/dashboard/api-keys')
@auth.login_required
def dashboard_api_keys():
    """API Keys management page"""
    try:
        user = auth.current_user()
        api_keys = db.get_api_keys(user['id'])
        return render_template('console/keys.html', user=user, api_keys=api_keys)
    except Exception as e:
        print(f"Dashboard API keys error: {str(e)}")
        return redirect(url_for('login'))

@app.route('/dashboard/integrations')
@auth.login_required
def dashboard_integrations():
    """Integrations management page"""
    try:
        user = auth.current_user()
        notion_integration = db.get_integration(user['id'], 'notion')
        notion_connected = notion_integration is not None and notion_integration.get('is_active', False)
        
        openai_keys = [k for k in db.get_api_keys(user['id']) if k.get('type', '').lower() == 'openai']
        openai_connected = len(openai_keys) > 0
        
        return render_template('console/integrations.html', 
                             user=user,
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
        return render_template('console/settings.html', user=user, workflow_defaults=workflow_defaults)
    except Exception as e:
        print(f"Dashboard settings error: {str(e)}")
        return redirect(url_for('login'))

# ============================================================================
# ADMIN PANEL ROUTES
# ============================================================================

@app.route('/admin')
@auth.admin_required
def admin_dashboard():
    """Admin dashboard - redirect to admin home"""
    return redirect(url_for('admin_home'))


@app.route('/admin/home')
@auth.admin_required
def admin_home():
    """Admin home page with overview stats"""
    try:
        user = auth.current_user()
        
        # Fetch stats
        all_users = db.get_all_users()
        companies = db.get_companies()
        
        # Count users with passwords set (active)
        active_users = len([u for u in all_users if u.get('is_password_set')])
        
        # Enrich users with company names
        company_lookup = {c['id']: c for c in companies}
        for u in all_users:
            if u.get('company_id'):
                company = company_lookup.get(u['company_id'])
                if company:
                    u['company_name'] = company.get('name')
        
        stats = {
            'total_users': len(all_users),
            'active_users': active_users,
            'total_companies': len(companies),
            'total_widgets': len(companies)  # Each company has one widget
        }
        
        return render_template('console/admin_home.html',
                             user=user,
                             stats=stats,
                             recent_users=all_users[:10])
    except Exception as e:
        print(f"Admin home error: {str(e)}")
        return redirect(url_for('admin_users'))



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

        return render_template('console/users.html',
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
        # Get system stats
        companies = db.get_companies()
        all_users = db.get_all_users()

        role_counts = Counter((u.get('role') or 'user') for u in all_users)

        system_stats = {
            'companies': len(companies),
            'users': len(all_users),
            'admins': role_counts.get('admin', 0),
            'ceos': role_counts.get('ceo', 0),
            'workers': role_counts.get('worker', 0) + role_counts.get('user', 0)
        }
        
        return render_template('admin/system.html',
                             user=user,
                             system_stats=system_stats)
    except Exception as e:
        print(f"Admin system error: {str(e)}")
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/widgets')
@auth.admin_required
def admin_widgets():
    """Admin widget manager - list all companies with widget stats"""
    try:
        import chat_analytics
        user = auth.current_user()
        
        # Get all companies with their statistics
        companies_summaries = chat_analytics.get_all_companies_summary()
        
        #Get widget configurations
        db_client = db.get_db()
        widget_configs = {}
        if db_client:
            for company in companies_summaries:
                config_result = db_client.table('widget_configs').select('*').eq(
                    'company_id', company['company_id']
                ).eq('is_active', True).execute()
                if config_result.data and len(config_result.data) > 0:
                    widget_configs[company['company_id']] = config_result.data[0]
        
        return render_template('console/widgets.html',
                             user=user,
                             companies=companies_summaries,
                             widget_configs=widget_configs)
    except Exception as e:
        print(f"Admin widgets error: {str(e)}")
        import traceback
        traceback.print_exc()
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/widgets/<company_id>')
@auth.admin_required
def admin_widget_detail(company_id):
    """Detailed widget statistics and configuration for a company"""
    try:
        import chat_analytics
        user = auth.current_user()
        
        # Get company details
        company = db.get_company_by_id(company_id)
        if not company:
            return redirect(url_for('admin_widgets'))
        
        # Get statistics
        stats_30d = chat_analytics.get_company_stats(company_id, days=30)
        stats_today = chat_analytics.get_today_stats(company_id)
        
        # Get widget configuration
        chat_service = get_chat_service()
        widget_config = chat_service.get_widget_config(db, 'default', company_id)
        if not widget_config:
            widget_config = chat_service.get_default_widget_config()
        
        # Get recent sessions
        db_client = db.get_db()
        recent_sessions = []
        if db_client:
            sessions_result = db_client.table('chat_sessions').select('*').eq(
                'company_id', company_id
            ).order('created_at', desc=True).limit(20).execute()
            recent_sessions = sessions_result.data if sessions_result.data else []
        
        # Generate embed code with explicit API URL for maximum reliability
        base_url = request.host_url.rstrip('/')
        embed_code = f'''\u003cscript src="{base_url}/widget/embed.js" 
    data-company-id="{company_id}"
    data-api-url="{base_url}"
    data-theme="glassmorphism"
    data-position="bottom-right"\u003e
\u003c/script\u003e'''
        
        return render_template('admin/widget_detail.html',
                             user=user,
                             company=company,
                             stats_30d=stats_30d,
                             stats_today=stats_today,
                             widget_config=widget_config,
                             recent_sessions=recent_sessions,
                             embed_code=embed_code)
    except Exception as e:
        print(f"Admin widget detail error: {str(e)}")
        import traceback
        traceback.print_exc()
        return redirect(url_for('admin_widgets'))

@app.route('/admin/widgets/<company_id>/customize')
@auth.admin_required
def admin_widget_customize(company_id):
    """Widget customization interface"""
    try:
        user = auth.current_user()
        db_client = db.get_db()
        
        # Get company details
        company_result = db_client.table('companies').select('*').eq('id', company_id).execute()
        if not company_result.data or len(company_result.data) == 0:
            return redirect(url_for('admin_widgets'))
        
        company = company_result.data[0]
        
        return render_template('admin/widget_customize.html',
                             user=user,
                             company=company)
    except Exception as e:
        print(f"Admin widget customize error: {str(e)}")
        import traceback
        traceback.print_exc()
        return redirect(url_for('admin_widgets'))

# Widget Settings API Routes
@app.route('/api/admin/companies/<company_id>/widget-settings', methods=['GET'])
@auth.admin_required
def api_get_widget_settings(company_id):
    """Get widget settings for a company"""
    try:
        db_client = db.get_db()
        company_result = db_client.table('companies').select('widget_settings').eq('id', company_id).execute()
        
        if not company_result.data or len(company_result.data) == 0:
            return jsonify({'error': 'Company not found'}), 404
        
        settings = company_result.data[0].get('widget_settings', {})
        return jsonify({'settings': settings})
    except Exception as e:
        print(f"Get widget settings error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/companies/<company_id>/widget-settings', methods=['POST'])
@auth.admin_required
def api_save_widget_settings(company_id):
    """Save widget settings for a company"""
    try:
        data = request.get_json()
        if not data or 'settings' not in data:
            return jsonify({'error': 'No settings provided'}), 400
        
        settings = data['settings']
        
        db_client = db.get_db()
        update_result = db_client.table('companies').update({
            'widget_settings': settings
        }).eq('id', company_id).execute()
        
        if not update_result.data:
            return jsonify({'error': 'Failed to update settings'}), 500
        
        return jsonify({'success': True, 'message': 'Settings saved successfully'})
    except Exception as e:
        print(f"Save widget settings error: {str(e)}")
        return jsonify({'error': str(e)}), 500





# Knowledge Base API Routes
from bot.knowledge import KnowledgeBase
kb_manager = KnowledgeBase(db)

@app.route('/api/admin/companies/<company_id>/knowledge', methods=['GET'])
@auth.admin_required
def api_get_company_knowledge(company_id):
    """Get knowledge entries for a company"""
    try:
        category = request.args.get('category')
        tags = request.args.getlist('tags')
        query = request.args.get('q')
        
        entries = kb_manager.get_knowledge(company_id, limit=100, category=category, tags=tags, query=query)
        categories = kb_manager.get_categories(company_id)
        
        return jsonify({
            'entries': entries,
            'categories': categories
        })
    except Exception as e:
        print(f"Get knowledge error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/companies/<company_id>/knowledge', methods=['POST'])
@auth.admin_required
def api_add_company_knowledge(company_id):
    """Add knowledge entry"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        entry = kb_manager.add_knowledge(
            company_id=company_id,
            title=data.get('title'),
            content=data.get('content'),
            source_url=data.get('source_url'),
            category=data.get('category'),
            tags=data.get('tags'), # Expecting list
            type=data.get('type', 'text'),
            metadata=data.get('metadata')
        )
        
        if entry:
            return jsonify({'success': True, 'entry': entry})
        return jsonify({'error': 'Failed to add entry'}), 500
    except Exception as e:
        print(f"Add knowledge error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/companies/<company_id>/knowledge/<entry_id>', methods=['PUT'])
@auth.admin_required
def api_update_company_knowledge(company_id, entry_id):
    """Update knowledge entry"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Clean up data to only include valid fields if necessary, or trust kb_manager to handle (it does generic update)
        allowed_fields = ['title', 'content', 'source_url', 'category', 'tags', 'type', 'metadata', 'is_active']
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        
        entry = kb_manager.update_knowledge(entry_id, updates)
        
        if entry:
            return jsonify({'success': True, 'entry': entry})
        return jsonify({'error': 'Failed to update entry'}), 500
    except Exception as e:
        print(f"Update knowledge error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/companies/<company_id>/knowledge/<entry_id>', methods=['DELETE'])
@auth.admin_required
def api_delete_company_knowledge(company_id, entry_id):
    """Delete knowledge entry"""
    try:
        success = kb_manager.delete_knowledge(entry_id)
        if success:
            return jsonify({'success': True})
        return jsonify({'error': 'Failed to delete entry'}), 500
    except Exception as e:
        print(f"Delete knowledge error: {str(e)}")
        return jsonify({'error': str(e)}), 500


                
        return jsonify({'success': True, 'pages_count': count, 'results': results})
    except Exception as e:
        print(f"Scrape error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/admin/chat')
@auth.admin_required
def admin_chat():
    """Admin AI chat widget management page"""
    try:
        user = auth.current_user()
        chat_service = get_chat_service()
        
        # Check configurations
        openai_configured = chat_service.is_configured()
        openai_model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
        
        # Get widget config
        config = chat_service.get_widget_config(db, 'default')
        if not config:
            config = chat_service.get_default_widget_config()
        
        # Get stats from database
        stats = {
            'total_sessions': 0,
            'active_sessions': 0,
            'total_messages': 0,
            'messages_24h': 0
        }
        
        sessions = []
        try:
            db_client = db.get_db()
            if db_client:
                # Get session count
                sessions_result = db_client.table('chat_sessions').select('*').order('created_at', desc=True).limit(10).execute()
                sessions = sessions_result.data if sessions_result.data else []
                stats['total_sessions'] = len(sessions_result.data) if sessions_result.data else 0
                stats['active_sessions'] = sum(1 for s in sessions if s.get('is_active'))
                
                # Get message count
                messages_result = db_client.table('chat_messages').select('id', count='exact').execute()
                stats['total_messages'] = messages_result.count if hasattr(messages_result, 'count') and messages_result.count else 0
        except Exception as e:
            print(f"Error getting chat stats: {e}")
        
        return render_template('admin/chat.html',
                             user=user,
                             openai_configured=openai_configured,
                             openai_model=openai_model,
                             config=config,
                             stats=stats,
                             sessions=sessions)
    except Exception as e:
        print(f"Admin chat error: {str(e)}")
        import traceback
        traceback.print_exc()
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
        return redirect(url_for('admin_users'))

@app.route('/admin/companies')
@auth.admin_required
def admin_companies():
    """Admin companies management page"""
    try:
        user = auth.current_user()
        companies = db.get_companies()
        all_users = db.get_all_users()

        # Count users per company
        user_counts = defaultdict(int)
        for entry in all_users:
            company_id = entry.get('company_id')
            if company_id:
                user_counts[company_id] += 1

        # Add user_count to each company
        for company in companies:
            company['user_count'] = user_counts.get(company['id'], 0)

        return render_template('console/companies.html',
                             user=user,
                             companies=companies,
                             total_users=len(all_users))
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


        role_counter = Counter((u.get('role') or 'worker') for u in company_users)
        total_users = len(company_users)
        user_stats = {
            'total': total_users,
            'admins': role_counter.get('admin', 0),
            'ceos': role_counter.get('ceo', 0),
            'workers': role_counter.get('worker', 0) + role_counter.get('user', 0)
        }

        return render_template('admin/company-detail.html',
                             user=user,
                             company=company,
                             members=company_users,
                             user_stats=user_stats)
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
        
        # Ensure session is saved after password setup - CRITICAL for session persistence
        session.permanent = True
        session.modified = True
        
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
        
        # Create response and ensure session cookie is set
        response = jsonify({
            'message': 'Password set successfully',
            'user': {'id': user['id'], 'name': user['name']},
            'redirect': redirect_url
        })
        
        # Ensure session is saved by accessing it
        _ = session.get('user_id')
        
        return response
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
        
        # Ensure session is saved after login - CRITICAL for session persistence
        session.permanent = True
        session.modified = True
        
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
        
        # Debug: verify session is set
        print(f"DEBUG: API login response - session['user_id'] = {session.get('user_id')}, redirect: {redirect_url}")
        
        # Create response and ensure session cookie is set
        response = jsonify({
            'message': 'Logged in', 
            'user': user,
            'redirect': redirect_url
        })
        
        # Ensure session is saved by accessing it
        _ = session.get('user_id')
        
        return response
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
    try:
        data = request.get_json() or {}
        print(f"DEBUG: Updating user {user_id} with data: {data}")
        
        success_count = 0
        db_client = db.get_db()
        
        # Try updating each field individually to handle missing columns
        # Update name
        if 'name' in data and data['name']:
            try:
                db_client.table('users').update({'name': data['name'].strip()}).eq('id', user_id).execute()
                success_count += 1
                print(f"DEBUG: Updated name")
            except Exception as e:
                print(f"DEBUG: Failed to update name: {e}")
        
        # Update role (may not exist in DB)
        if 'role' in data:
            role = (data['role'] or '').strip()
            if role in ('user', 'admin', 'ceo', 'worker'):
                try:
                    db_client.table('users').update({'role': role}).eq('id', user_id).execute()
                    success_count += 1
                    print(f"DEBUG: Updated role to {role}")
                except Exception as e:
                    print(f"DEBUG: Failed to update role (column may not exist): {e}")
        
        # Update company_id
        if 'company_id' in data:
            company_id = (data.get('company_id') or '').strip()
            company_id = company_id if company_id else None
            try:
                db_client.table('users').update({'company_id': company_id}).eq('id', user_id).execute()
                success_count += 1
                print(f"DEBUG: Updated company_id to {company_id}")
            except Exception as e:
                print(f"DEBUG: Failed to update company_id (column may not exist): {e}")
        
        if success_count > 0:
            return jsonify({'message': 'User updated'})
        
        return jsonify({'error': 'No updates could be applied. Some database columns may be missing.'}), 500
    except Exception as e:
        print(f"Error in api_admin_update_user: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@auth.admin_required
def api_admin_delete_user(user_id):
    """Delete user (admin only)"""
    try:
        success = db.delete_user(user_id)
        if success:
            return jsonify({'message': 'User deleted'})
        return jsonify({'error': 'Failed to delete user'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
    
    if not name:
        return jsonify({'error': 'Company name is required'}), 400
    
    # If slug not provided, it will be auto-generated in create_company
    try:
        company = db.create_company(name, slug or '', settings)
        return jsonify({'message': 'Company created successfully', 'company': company})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error creating company: {e}")
        return jsonify({'error': f'Failed to create company: {str(e)}'}), 400

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
    
    # Verify company exists
    company = db.get_company_by_id(company_id)
    if not company:
        return jsonify({'error': 'Company not found'}), 404
    
    try:
        # Check if user exists
        existing_user = db.get_user_by_name(name)
        
        if existing_user:
            # Assign existing user to company
            success = db.assign_user_to_company(existing_user['id'], company_id, role)
            if success:
                updated_user = db.get_user_by_id(existing_user['id'])
                return jsonify({'success': True, 'user': updated_user, 'message': 'User assigned to company'}), 200
            else:
                return jsonify({'error': 'Failed to assign user to company'}), 500
        else:
            # Create new user and assign to company
            new_user = auth.create_user_admin(name, role=role, company_id=company_id)
            if new_user:
                return jsonify({'success': True, 'user': new_user, 'message': 'User created and assigned to company'}), 201
            else:
                return jsonify({'error': 'Failed to create user'}), 500
    except Exception as e:
        print(f"Error adding company member: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/companies/<company_id>/members/<user_id>', methods=['DELETE'])
@auth.admin_required
def api_admin_remove_company_member(company_id, user_id):
    """Remove a member from a company (admin only)"""
    try:
        # Verify company exists
        company = db.get_company_by_id(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        # Verify user exists and belongs to company
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('company_id') != company_id:
            return jsonify({'error': 'User does not belong to this company'}), 400
        
        # Remove user from company
        success = db.remove_user_from_company(user_id)
        if success:
            return jsonify({'message': 'User removed from company'})
        else:
            return jsonify({'error': 'Failed to remove user from company'}), 500
    except Exception as e:
        print(f"Error removing company member: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/companies/<company_id>/members/<user_id>', methods=['PUT'])
@auth.admin_required
def api_admin_update_company_member(company_id, user_id):
    """Update member role in company (admin only)"""
    data = request.get_json() or {}
    role = data.get('role', '').strip()
    
    if role not in ['ceo', 'worker']:
        return jsonify({'error': 'Invalid role. Must be ceo or worker'}), 400
    
    try:
        # Verify company exists
        company = db.get_company_by_id(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        # Verify user exists and belongs to company
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('company_id') != company_id:
            return jsonify({'error': 'User does not belong to this company'}), 400
        
        # Update user role
        success = db.assign_user_to_company(user_id, company_id, role)
        if success:
            updated_user = db.get_user_by_id(user_id)
            return jsonify({'message': 'Member role updated', 'user': updated_user})
        else:
            return jsonify({'error': 'Failed to update member role'}), 500
    except Exception as e:
        print(f"Error updating company member: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/companies/<company_id>/executions', methods=['GET'])
@auth.admin_required
def api_admin_get_company_executions(company_id):
    """Get company workflow executions (admin only)"""
    try:
        # Verify company exists
        company = db.get_company_by_id(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        limit = request.args.get('limit', 100, type=int)
        executions = db.get_company_executions(company_id, limit=limit)
        return jsonify(executions)
    except Exception as e:
        print(f"Error getting company executions: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# CEO API ROUTES
# ============================================================================



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

def validate_no_pii(data: dict) -> Tuple[bool, Optional[str]]:
    """
    Validate that request data contains no PII fields.
    
    Privacy-preserving validation: Rejects any request containing user identification
    fields to ensure user_id is never accepted from client requests.
    
    Args:
        data: Dictionary to validate
        
    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if no PII fields found
        - error_message: Error description if PII detected, None otherwise
    """
    # List of PII field names to reject (case-insensitive check)
    pii_fields = [
        'user_id', 'user_uuid', 'uuid', 'id',
        'email', 'email_address',
        'name', 'username', 'user_name',
        'phone', 'phone_number', 'mobile',
        'device_id', 'device_uuid',
        'session_id', 'auth_token', 'token'
    ]
    
    if not isinstance(data, dict):
        return False, "Invalid request format"
    
    # Check for PII fields (case-insensitive)
    data_lower = {k.lower(): v for k, v in data.items()}
    for pii_field in pii_fields:
        if pii_field in data_lower:
            return False, f"Request contains unauthorized field"
    
    return True, None


def mask_uuid_for_logging(uuid_str: Optional[str]) -> str:
    """
    Mask UUID in logs to prevent PII exposure.
    
    Args:
        uuid_str: UUID string to mask
        
    Returns:
        Masked string like '[USER_ID]' or '[UUID]'
    """
    if not uuid_str:
        return '[USER_ID]'
    # Show only first 8 chars and last 4 chars for debugging, but in production mask completely
    if os.getenv('ENV') == 'production' or os.getenv('VERCEL'):
        return '[USER_ID]'
    return f'{uuid_str[:8]}...{uuid_str[-4:]}'








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
# CHAT WIDGET API ROUTES
# ============================================================================

from chat_service import get_chat_service
import uuid as uuid_lib

@app.route('/api/chat/message', methods=['POST', 'OPTIONS'])
def chat_message():
    """Handle incoming chat messages from the widget"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        message = data.get('message', '').strip()
        session_key = data.get('session_id') or data.get('session_key')
        widget_id = data.get('widget_id', 'default')
        company_id = data.get('company_id')  # Multi-tenant company identifier
        user_context = data.get('context', {})
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Generate session key if not provided
        if not session_key:
            session_key = f"widget_{uuid_lib.uuid4().hex[:16]}"
        
        chat_service = get_chat_service()
        
        # Get company context for multi-tenant routing
        company_context = None
        if company_id:
            company_context = chat_service.get_company_context(db, company_id)
        
        # Get or create session with company_id
        session, is_new = chat_service.get_or_create_session(
            db,
            session_key=session_key,
            widget_id=widget_id,
            company_id=company_id,
            context=user_context
        )
        
        if not session:
            return jsonify({'error': 'Failed to create session'}), 500
        
        # Use internal ID if available, otherwise session_key
        session_id = session.get('id') or session.get('session_key')
        
        # Save user message
        user_msg = chat_service.save_message(
            db, session_id, 'user', message
        )
        
        # Get conversation history for context
        history = chat_service.get_conversation_history(db, session_id, limit=20)
        
        # Get widget config (optionally filtered by company)
        widget_config = chat_service.get_widget_config(db, widget_id, company_id)
        if not widget_config:
            widget_config = chat_service.get_default_widget_config()
        
        system_prompt = widget_config.get('system_prompt') or chat_service.default_system_prompt
        
        # Inject Knowledge Base Context (Phase 3)
        if company_id:
            knowledge_context = chat_service.get_company_knowledge(db, company_id)
            if knowledge_context:
                system_prompt += f"\n\n{knowledge_context}\n\nUse the above Company Knowledge Base to answer questions accurately."


        
        # Check if scheduling is enabled
        enable_scheduling = False
        if widget_config.get('settings', {}).get('scheduling', {}).get('enabled'):
            enable_scheduling = True
            system_prompt += "\n\nYou have access to an appointment booking tool. If the user wants to book, ask for their Name, Email, and Preferred Date/Time needed to use the tool."

        # Direct ChatGPT response (fallback or primary)
        if chat_service.is_configured():
            ai_response, response_metadata = chat_service.generate_response(
                history,
                system_prompt=system_prompt,
                db_module=db,
                company_id=company_id,
                session_id=session_id,  # Need UUID for appt
                enable_tools=enable_scheduling
            )
        
        if ai_response:
            # Save AI response
            ai_msg = chat_service.save_message(
                db, session_id, 'assistant', ai_response,
                tokens_used=response_metadata.get('tokens_total'),
                model=response_metadata.get('model'),
                metadata=response_metadata
            )
            
            response = jsonify({
                'status': 'success',
                'session_id': session_key,
                'response': ai_response,
                'message_id': ai_msg['id'] if ai_msg else None,
                'metadata': {
                    'tokens_used': response_metadata.get('tokens_total'),
                    'model': response_metadata.get('model')
                }
            })
        else:
            # No AI configured: Fallback to Demo Mode to prevent "Error" state in UI
            # error_msg = response_metadata.get('error', 'AI service not available')
            
            demo_response = "Kian Demo: I'm ready to chat! Please configure your OpenAI API Key in the .env file to enable real intelligence."
            
            # Save demo message so history works
            msg = chat_service.save_message(
                db, session_id, 'assistant', demo_response,
                metadata={'is_demo': True}
            )
            
            response = jsonify({
                'status': 'success',
                'session_id': session_key,
                'response': demo_response,
                'message_id': msg['id'] if msg else None,
                'metadata': {'demo': True}
            })
        
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
        
    except Exception as e:
        print(f"Chat message error: {e}")
        import traceback
        traceback.print_exc()
        response = jsonify({'error': 'Internal server error', 'details': str(e)})
        response.status_code = 500
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response


@app.route('/api/chat/history/<session_key>', methods=['GET', 'OPTIONS'])
def chat_history(session_key):
    """Get conversation history for a session"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    try:
        chat_service = get_chat_service()
        
        # Get session
        session, _ = chat_service.get_or_create_session(db, session_key)
        if not session:
            response = jsonify({'messages': [], 'session_id': session_key})
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response
        
        # Get messages
        limit = request.args.get('limit', 50, type=int)
        history = chat_service.get_conversation_history(db, session['id'], limit=limit)
        
        # Transform for client
        # JSONB messages: {role, content, timestamp ...}
        client_history = []
        for msg in history:
            client_history.append({
                'sender': msg.get('role'), # 'user' or 'assistant'
                'text': msg.get('content'),
                'timestamp': msg.get('timestamp')
            })
            
        response = jsonify({'history': client_history, 'session_id': session_key})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
        
    except Exception as e:
        print(f"History error: {e}")
        response = jsonify({'error': 'Internal server error'})
        response.status_code = 500
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response


@app.route('/api/chat/reset', methods=['POST', 'OPTIONS'])
def chat_reset():
    """Reset chat session (New Chat)"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
        
    try:
        data = request.get_json()
        session_key = data.get('session_id')
        
        if session_key:
            chat_service = get_chat_service()
            # Resolve to UUID
            session, _ = chat_service.get_or_create_session(db, session_key)
            if session:
                chat_service.close_session(db, session['id'])
        
        # Generate new session key
        # We don't necessarily need to return a key, the client will generate one or we return one.
        # Client usually generates or we return one.
        new_session_key = f"widget_{uuid_lib.uuid4().hex[:16]}"
        
        response = jsonify({
            'status': 'success',
            'new_session_id': new_session_key
        })
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
        
    except Exception as e:
        print(f"Reset error: {e}")
        response = jsonify({'error': 'Internal server error'})
        response.status_code = 500
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
        messages = chat_service.get_conversation_history(db, session['id'], limit)
        
        # Format for frontend
        formatted = [{
            'id': msg['id'],
            'role': msg['role'],
            'content': msg['content'],
            'timestamp': msg['created_at']
        } for msg in messages]
        
        response = jsonify({
            'session_id': session_key,
            'messages': formatted
        })
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
        
    except Exception as e:
        print(f"Chat history error: {e}")
        response = jsonify({'error': str(e), 'messages': []})
        response.status_code = 500
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response





@app.route('/api/chat/config', methods=['GET', 'OPTIONS'])
def chat_config():
    """Get widget configuration"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    try:
        widget_id = request.args.get('widget_id', 'default')
        chat_service = get_chat_service()
        
        config = chat_service.get_widget_config(db, widget_id)
        if not config:
            config = chat_service.get_default_widget_config()
        
        # Remove sensitive fields
        safe_config = {
            'widget_id': config.get('widget_id'),
            'name': config.get('name'),
            'theme': config.get('theme'),
            'position': config.get('position'),
            'welcome_message': config.get('welcome_message'),
            'placeholder_text': config.get('placeholder_text'),
            'primary_color': config.get('primary_color'),
            'settings': config.get('settings', {})
        }
        
        response = jsonify(safe_config)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
        
    except Exception as e:
        print(f"Chat config error: {e}")
        response = jsonify({'error': str(e)})
        response.status_code = 500
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response


@app.route('/widget/embed.js', methods=['GET'])
def widget_embed_script():
    """Serve the embeddable widget JavaScript"""
    try:
        widget_js_path = os.path.join(app.static_folder, 'js', 'chat-widget.js')
        if os.path.exists(widget_js_path):
            response = send_file(widget_js_path, mimetype='application/javascript')
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response
        else:
            return "// Widget not found", 404
    except Exception as e:
        print(f"Widget embed error: {e}")
        return f"// Error: {str(e)}", 500


@app.route('/widget/styles.css', methods=['GET'])
def widget_styles():
    """Serve the widget CSS"""
    try:
        widget_css_path = os.path.join(app.static_folder, 'css', 'chat-widget.css')
        if os.path.exists(widget_css_path):
            response = send_file(widget_css_path, mimetype='text/css')
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Cache-Control'] = 'public, max-age=3600'
            return response
        else:
            return "/* Widget styles not found */", 404
    except Exception as e:
        print(f"Widget styles error: {e}")
        return f"/* Error: {str(e)} */", 500


@app.route('/widget-demo')
def widget_demo():
    """Demo page showcasing the chat widget with different themes"""
    return render_template('widget-demo.html')

@app.route('/admin/widgets/<company_id>/test')
@auth.admin_required
def admin_widget_test(company_id):
    """Test page for a specific company widget"""
    try:
        user = auth.current_user()
        company = db.get_company_by_id(company_id)
        
        if not company:
            return "Company not found", 404
            
        settings = company.get('settings', {})
        
        # Ensure we can test locally or remotely
        return render_template('admin/test_widget.html', 
                             company=company,
                             settings=settings)
    except Exception as e:
        return f"Error: {str(e)}", 500


# Expose app as 'application' for Vercel's Python runtime
application = app

if __name__ == '__main__':
    # Start Flask development server
    app.run(host='0.0.0.0', port=5001, debug=True)
