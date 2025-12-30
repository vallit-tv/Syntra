# Quick Start Guide - Syntra Fixed

## ✅ All Issues Fixed!

Your Supabase integration is now working. Here's what was done:

### Fixed:
1. ✅ Supabase client initialization error
2. ✅ API key generation script
3. ✅ Dependency compatibility issues
4. ✅ Vercel configuration optimization

### What Works Now:
- Database connectivity ✅
- API key generation ✅
- User authentication ✅
- Ready for Vercel deployment ✅

## Running Locally

```bash
cd /Users/theoreichert/Documents/Projects/Syntra
source .venv/bin/activate

# Generate an API key for iOS Shortcut
python3 generate_api_key.py

# Run the app
flask run
```

## Deploying to Vercel

```bash
vercel --prod
```

Make sure these environment variables are set in Vercel:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`  
- `FLASK_SECRET_KEY`
- `N8N_API_KEY` (optional)
- `N8N_URL` (optional)

After deployment:
1. Visit `https://your-app.vercel.app/init-theo` to create admin user
2. Login at `https://your-app.vercel.app/login`

## Important: Fresh Install

If you reinstall dependencies or set up on a new machine:

```bash
pip install -r requirements.txt
python3 patch_gotrue.py  # ← IMPORTANT! Must run this after pip install
```

## Need Help?

See [`DEPLOYMENT.md`](file:///Users/theoreichert/Documents/Projects/Syntra/DEPLOYMENT.md) for comprehensive documentation.

## Test Your Setup

```bash
# Test database connection
python3 test_supabase_client.py

# Test API key generation  
python3 generate_api_key.py
```

Both should now work without errors!
