import os
import sys

# Get the directory containing this file (api/)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Add it to sys.path so we can import siblings like app.py, db.py, etc.
# This fixes "ModuleNotFoundError: No module named 'app'" on Vercel
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app import app
