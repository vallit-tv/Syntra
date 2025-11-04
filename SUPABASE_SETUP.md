# Supabase Setup Guide

## Quick Setup Steps

### 1. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in to your account
2. Create a new project or select an existing one
3. Navigate to **Project Settings** → **API**
4. Copy these values:
   - **Project URL**: Found under "Project URL" (e.g., `https://xxxxx.supabase.co`)
   - **anon key**: Found under "Project API keys" → "anon" `public`
   - **service_role key**: Found under "Project API keys" → "service_role" `secret` ⚠️ Keep this secret!

### 2. Local Development (.env file)

Create a `.env` file in the project root:

```bash
# Flask Configuration
FLASK_SECRET_KEY=your-secret-key-here-change-this-in-production
FLASK_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# External API Keys
OPENAI_API_KEY=your-openai-key
NOTION_API_KEY=your-notion-key

# HuggingFace API
HGFTOKEN=your-huggingface-token

# N8N
N8N_API_KEY=your-n8n-api-key
```

### 3. Vercel Production Environment

For your Vercel deployment, add these environment variables:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Syntra** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   - `SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `SUPABASE_SERVICE_KEY` = `your-service-role-key`
   - `FLASK_SECRET_KEY` = `a-random-secret-key-for-sessions`
   - (Add any other API keys you need)

5. Click **Save** and **Redeploy** your project

### 4. Required Database Tables

**IMPORTANT: You MUST create the database tables before the app will work!**

Run the complete SQL schema file in your Supabase SQL Editor:

1. Go to your Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Open the file `supabase_schema.sql` from this project
4. Copy and paste the ENTIRE contents into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)

The schema file (`supabase_schema.sql`) includes:
- `users` table with password support
- `api_keys` table for user API keys
- Indexes for performance
- Row Level Security (RLS) policies
- Auto-update triggers

**This is a one-time setup - you only need to run it once!**

### 5. Verify Connection

After setting up, test the connection:

```bash
python3 -c "from db import get_db; db = get_db(); print('✅ Connected to Supabase!')"
```

## Security Notes

- ⚠️ **Never commit `.env` file** to git (it's in `.gitignore`)
- ⚠️ **Service Role Key** has admin access - keep it secret!
- ✅ Use **Anon Key** for client-side operations (less privileged)
- ✅ Use **Service Role Key** only in server-side code (like this Flask app)

## Troubleshooting

**Error: "Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env"**
- Make sure your `.env` file exists and has the correct variable names
- Check that you're in the project root directory

**Connection errors:**
- Verify your Supabase project is active
- Check that your API keys are correct (no extra spaces)
- Ensure your Supabase project URL is correct

