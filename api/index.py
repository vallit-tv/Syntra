# Import the Flask app from the current directory (api package)
from .app import app

# Vercel expects a variable named 'app' (or 'handler', 'application')
# This file serves as the entry point for Vercel Serverless Function
