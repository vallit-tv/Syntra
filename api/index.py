import os
import sys

# Add the parent directory to sys.path so we can import from root
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import the Flask app
from app import app

# Vercel expects a variable named 'app' (or 'handler', 'application')
# This file serves as the entry point for Vercel Serverless Function
