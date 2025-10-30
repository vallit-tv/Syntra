# Syntra - Simple Flask Application

A clean, simple Flask application built with Python, HTML, CSS, and JavaScript.

## Project Structure

```
/
├── app.py                 # Main Flask application (all routes)
├── auth.py                # Authentication logic
├── db.py                  # Database operations (Supabase)
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── templates/            # HTML templates
│   ├── base.html         # Base template with header/footer
│   ├── index.html        # Homepage
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── dashboard.html    # User dashboard
│   └── ...               # Other pages
├── static/
│   ├── css/
│   │   └── style.css     # All CSS styles
│   ├── js/
│   │   └── main.js       # JavaScript functions
│   └── images/           # Images
└── README.md             # This file
```

## Setup

1. **Create virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run application:**
   ```bash
   python app.py
   ```

5. **Open browser:**
   ```
   http://localhost:5000
   ```

## Files Explained

### `app.py`
- Main Flask application
- All routes (pages and APIs)
- Simple and easy to understand

### `auth.py`
- Handles login/register/logout
- Session management
- Secure token-based authentication

### `db.py`
- All database operations
- Connects to Supabase
- Functions for users, API keys, etc.

### Templates
- `base.html` - Header, footer, navigation (used by all pages)
- Other HTML files - Individual page content

### Static Files
- `static/css/style.css` - All styling
- `static/js/main.js` - JavaScript functions

## How It Works

1. **User visits a page** → Flask renders HTML template
2. **User submits form** → JavaScript sends data to API endpoint
3. **API processes request** → Uses `auth.py` and `db.py`
4. **Response sent back** → JavaScript updates page

## Adding Features

1. **New page?** → Add route in `app.py`, create HTML in `templates/`
2. **New API?** → Add route in `app.py` under `# APIs` section
3. **Database query?** → Add function in `db.py`
4. **Styling?** → Add CSS to `static/css/style.css`

Simple and straightforward!
