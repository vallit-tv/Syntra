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

def find_gotrue_file():
    """Find the gotrue_base_api.py file in the virtual environment"""
    # Try to find the file in the current virtual environment
    venv_path = sys.prefix
    gotrue_file = os.path.join(
        venv_path,
        'lib',
        f'python{sys.version_info.major}.{sys.version_info.minor}',
        'site-packages',
        'gotrue',
        '_sync',
        'gotrue_base_api.py'
    )
    
    if os.path.exists(gotrue_file):
        return gotrue_file
    
    return None

def patch_gotrue():
    """Patch the gotrue library"""
    gotrue_file = find_gotrue_file()
    
    if not gotrue_file:
        print("❌ Error: Could not find gotrue library file")
        print(f"   Expected at: {gotrue_file}")
        print("   Make sure you've run: pip install -r requirements.txt")
        return False
    
    print(f"📁 Found gotrue file: {gotrue_file}")
    
    # Read the file
    with open(gotrue_file, 'r') as f:
        content = f.read()
    
    # Check if already patched
    if '# PATCHED:' in content:
        print("✅ File is already patched!")
        return True
    
    # Apply the patch
    original = """        self._http_client = http_client or SyncClient(
            verify=bool(verify),
            proxy=proxy,
            follow_redirects=True,
            http2=True,
        )"""
    
    patched = """        # PATCHED: Removed proxy parameter from SyncClient (not supported in httpx 0.23+)
        # Original code tried to pass proxy=proxy which causes TypeError
        self._http_client = http_client or SyncClient(
            verify=bool(verify),
            # proxy parameter removed - not supported in httpx >=0.23
            follow_redirects=True,
            http2=True,
        )"""
    
    if original in content:
        content = content.replace(original, patched)
        
        # Write the patched file
        with open(gotrue_file, 'w') as f:
            f.write(content)
        
        print("✅ Successfully patched gotrue library!")
        print("   The proxy parameter has been removed from httpx.SyncClient")
        return True
    else:
        print("⚠️  Warning: Could not find the expected code to patch")
        print("   The gotrue library may have been updated or already modified")
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
        print("✅ Patching complete! You can now run:")
        print("   python3 generate_api_key.py")
    else:
        print("❌ Patching failed. Please check the output above.")
    print("=" * 60)
    
    sys.exit(0 if success else 1)
