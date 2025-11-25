#!/bin/bash
# Vercel Build Hook - Patches gotrue library after pip install
# This file should be run during Vercel build process

echo "==============================================="
echo "Running Vercel Build Hook - Patching gotrue"
echo "==============================================="

# Install dependencies
pip install -r requirements.txt

# Run the gotrue patch
python3 patch_gotrue.py

echo "==============================================="
echo "Build hook completed successfully"
echo "==============================================="
