#!/usr/bin/env python3
"""
Patch gotrue library to fix httpx compatibility issue.

This script patches the gotrue library to remove the unsupported 'proxy' parameter
from httpx.SyncClient initialization. The proxy parameter was removed in httpx 0.23+
but gotrue 2.9.1 still tries to use it.

Run this after: pip install -r requirements.txt
"""
import os
import sys
import glob

def find_gotrue_file():
    """Find the gotrue_base_api.py file in site-packages"""
    
    # Try multiple search locations
    search_paths = [
        # Local venv
        os.path.join(sys.prefix, 'lib', f'python{sys.version_info.major}.{sys.version_info.minor}', 'site-packages'),
        # Vercel build environment
        '/var/task',
        '/var/runtime',
        # Alternative locations
        os.path.join(sys.prefix, 'lib', 'python*', 'site-packages'),
    ]
    
    print(f"Python prefix: {sys.prefix}")
    print(f"Python version: {sys.version_info.major}.{sys.version_info.minor}")
    print(f"Searching for gotrue library...")
    
    for base_path in search_paths:
        # Expand wildcards
        if '*' in base_path:
            expanded_paths = glob.glob(base_path)
        else:
            expanded_paths = [base_path] if os.path.exists(base_path) else []
        
        for path in expanded_paths:
            gotrue_file = os.path.join(path, 'gotrue', '_sync', 'gotrue_base_api.py')
            print(f"  Checking: {gotrue_file}")
            if os.path.exists(gotrue_file):
                print(f"  ✓ Found!")
                return gotrue_file
    
    # Last resort: search the entire Python path
    print("Searching sys.path...")
    for path in sys.path:
        if 'site-packages' in path or 'dist-packages' in path:
            gotrue_file = os.path.join(path, 'gotrue', '_sync', 'gotrue_base_api.py')
            print(f"  Checking: {gotrue_file}")
            if os.path.exists(gotrue_file):
                print(f"  ✓ Found!")
                return gotrue_file
    
    return None

def patch_gotrue():
    """Patch the gotrue library"""
    gotrue_file = find_gotrue_file()
    
    if not gotrue_file:
        print("❌ Error: Could not find gotrue library file")
        print(f"   Searched in sys.prefix: {sys.prefix}")
        print(f"   sys.path: {sys.path}")
        return False
    
    print(f"📁 Found gotrue file: {gotrue_file}")
    
    # Read the file
    try:
        with open(gotrue_file, 'r') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False
    
    # Check if already patched
    if '# PATCHED:' in content or 'PATCHED' in content:
        print("✅ File is already patched!")
        return True
    
    # Apply the patch - look for the proxy parameter usage
    if 'proxy=proxy,' in content or 'proxy=proxy)' in content:
        print("Applying patch...")
        # Remove the proxy parameter from SyncClient initialization
        content = content.replace('proxy=proxy,', '# proxy=proxy,  # PATCHED: removed')
        content = content.replace('proxy=proxy)', '# proxy=proxy  # PATCHED: removed\n        )')
        
        # Write the patched file
        try:
            with open(gotrue_file, 'w') as f:
                f.write(content)
            print("✅ Successfully patched gotrue library!")
            return True
        except Exception as e:
            print(f"❌ Error writing patched file: {e}")
            return False
    else:
        print("⚠️  Warning: Could not find proxy parameter in expected location")
        print("   The gotrue library may have been updated or structure changed")
        # Check if it's using a different pattern
        if 'SyncClient' in content and 'proxy' in content:
            print("   File contains SyncClient and proxy references, but in unexpected format")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("Gotrue Library Patcher for Syntra")
    print("=" * 60)
    print()
    
    success = patch_gotrue()
    
    print()
    print("=" * 60)
    if success:
        print("✅ Patching complete!")
    else:
        print("❌ Patching failed.")
        print("   The application may not work correctly.")
        print("   Check the logs above for details.")
    print("=" * 60)
    
    sys.exit(0 if success else 1)
