# Syntra Deployment Guide

## Overview

Syntra is a Flask-based workflow automation platform that integrates with Supabase (PostgreSQL), n8n (workflow engine), and various third-party services. This guide covers local development and Vercel deployment.

## Architecture

- **Backend**: Flask (Python) running on Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL with REST API)

- **Deployment**: Vercel

## Prerequisites

- Python 3.9+
- Supabase account and project
- n8n Cloud account (optional, for workflows)
- Vercel CLI (for deployment)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
cd /Users/theoreichert/Documents/Projects/Syntra
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Ensure your `.env` file contains:

```bash
# Flask Configuration
FLASK_SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_KEY=your-anon-key


```

### 3. Set Up Database Schema

1. Go to your Supabase Dashboard → SQL Editor
2. Run the SQL scripts in this order:
   - `supabase_schema.sql` (core tables)
   - `database_migration_companies.sql` (company features)
   - `database_migration_workflows.sql` (workflow system)
   - `database_migration_integrations.sql` (integrations)
   - `database_migration_daily_summary.sql` (daily summary feature)

### 4. Create Initial Admin User

**Option A: Using the script**
```bash
source .venv/bin/activate
python3 create_user.py
# Follow prompts to create "Theo" as admin
```

**Option B: Using the web interface**
```bash
# Start local server
flask run

# Visit http://localhost:5000/init-theo
# Click the button to initialize Theo as admin
```

### 5. Generate API Keys

```bash
source .venv/bin/activate
python3 generate_api_key.py
```

This will create an API key for the user "Theo" that can be used in iOS Shortcuts.

### 6. Run Locally

```bash
source .venv/bin/activate
flask run
```

Visit `http://localhost:5000`

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Configure Environment Variables

Go to your Vercel project dashboard → Settings → Environment Variables

Add the following (use the same values from your `.env` file):

**Required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `FLASK_SECRET_KEY`



**Important:** Make sure to set these for all environments (Production, Preview, Development)

### 4. Deploy

**First-time deployment:**
```bash
vercel
# Follow the prompts
```

**Production deployment:**
```bash
vercel --prod
```

### 5. Initialize Admin User on Vercel

After first deployment:

1. Visit `https://your-app.vercel.app/init-theo`
2. Click the button to create the admin user
3. Go to `https://your-app.vercel.app/login`
4. Login with username "Theo" (no password needed on first login)
5. Set up a password

## Post-Deployment

### Health Check

Visit `https://your-app.vercel.app/health` to verify:
- App is running
- Database is connected

### Debug Environment Variables

Visit `https://your-app.vercel.app/debug/env` to check which environment variables are properly set (values are hidden for security).

## Common Issues & Troubleshooting

### Issue: "Database not configured"

**Solution:** Check that `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are properly set in Vercel environment variables.

### Issue: "Table does not exist"

**Solution:** Run the database migration SQL scripts in your Supabase SQL Editor.

### Issue: "Session expired" or "User not found"

**Solution:** Make sure `FLASK_SECRET_KEY` is set and consistent across deployments. On Vercel, this must be set as an environment variable.

### Issue: API key generation fails

**Solution:** 
1. Ensure the user exists in the database
2. Check database connection with `/health` endpoint
3. Run the script with verbose error output (already includes traceback)

### Issue: Cold starts on Vercel

**Solution:** This is normal for Vercel's serverless architecture. The first request after inactivity may take 5-10 seconds. Subsequent requests will be fast.

## Using the Application

### For Admins (Theo)

1. **Login** at `/login`
2. **Admin Dashboard** at `/admin/dashboard`
3. **Manage Users** at `/admin/users`
4. **Manage Companies** at `/admin/companies`


### For CEOs

1. **Login** at `/login`
2. **Company Dashboard** at `/company/dashboard`

4. **Manage Team** at `/company/workers`
5. **Company Settings** at `/company/settings`

### For Workers

1. **Login** at `/login`
2. **Dashboard** at `/dashboard/overview`

4. **Manage API Keys** at `/dashboard/api-keys`



## Development Workflow

### Making Changes

1. Make changes locally
2. Test with `flask run`
3. Commit changes to git
4. Deploy with `vercel --prod`

### Database Migrations

1. Write SQL migration script
2. Test locally on Supabase
3. Run on production Supabase database
4. Document in migration file

### Adding New Features

1. Update `app.py` routes
2. Update `db.py` database functions
3. Create/update templates
4. Test locally
5. Deploy to Vercel

## Production Best Practices

1. **Always use HTTPS** (Vercel provides this automatically)
2. **Keep secrets in environment variables**, never in code
3. **Test locally before deploying**
4. **Monitor logs** via Vercel dashboard
5. **Regular database backups** via Supabase
6. **Use preview deployments** for testing (automatic with Vercel)

## Support & Resources

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Flask Documentation: https://flask.palletsprojects.com/


## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Initialize admin user
3. ✅ Set up database schema
4. ✅ Generate API keys
5. Create company and users

8. Set up monitoring
