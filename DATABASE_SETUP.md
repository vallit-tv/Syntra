# Database Setup Required

## Error: Table 'public.users' not found

The error you're seeing means the database tables haven't been created yet. You need to run the SQL schema in your Supabase project.

## Quick Setup Steps

### 1. Go to Supabase Dashboard
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create one if you don't have one)

### 2. Open SQL Editor
1. In the left sidebar, click **SQL Editor**
2. Click **New Query**

### 3. Run the Schema
1. Open the file `supabase_schema.sql` from this project
2. Copy the **ENTIRE** contents of the file
3. Paste it into the SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

### 4. Verify Tables Created
After running the SQL, you should see:
- ✅ Users table created successfully
- ✅ API keys table created successfully

### 5. Optional: Add Role Column
If you want role support (admin/ceo), also run:
1. Open `database_migration_add_roles.sql`
2. Copy and paste into SQL Editor
3. Click **Run**

### 6. Test Again
After creating the tables:
1. Go back to `/init-theo`
2. Click "Initialize Theo"
3. It should work now!

## What Tables Are Created?

- **users**: Stores user accounts with authentication
- **api_keys**: Stores user API keys for integrations

## Troubleshooting

If you still get errors:
1. Check that you're using the correct Supabase project
2. Verify your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` environment variables in Vercel
3. Make sure you ran the SQL in the correct database (should be the default project database)

## Need Help?

If you need to check your Supabase credentials:
1. Go to Supabase Dashboard → Project Settings → API
2. Copy the **Project URL** (this is your SUPABASE_URL)
3. Copy the **service_role** key (this is your SUPABASE_SERVICE_KEY) - keep this secret!

