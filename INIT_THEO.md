# Initialize Theo as CEO

To create the user "Theo" with CEO/admin privileges, you have several options:

## Option 1: Using the API Endpoint (Recommended)

Once your app is deployed, call this endpoint:

```bash
curl -X POST https://YOUR-APP-URL/api/admin/init-theo \
  -H 'Content-Type: application/json'
```

Replace `YOUR-APP-URL` with your actual Vercel deployment URL.

## Option 2: Using the create_user.py Script

```bash
# Set your API URL
export API_BASE_URL=https://YOUR-APP-URL

# Run the script
python3 create_user.py
```

## Option 3: Using the Admin API

```bash
curl -X POST https://YOUR-APP-URL/api/admin/create-user \
  -H 'Content-Type: application/json' \
  -d '{"name":"Theo","role":"ceo"}'
```

## Database Migration

**Important:** Before creating users with roles, you need to run the database migration:

1. Go to your Supabase Dashboard → SQL Editor
2. Run the contents of `database_migration_add_roles.sql`
3. This adds the `role` column to the users table

**Note:** The code will work even without the migration (it will default Theo to CEO), but it's recommended to run the migration for proper role support.

## After Creating Theo

1. Go to the login page
2. Enter "Theo" as the username
3. Click "Continue"
4. You'll be prompted to create your password
5. Set a strong password meeting the requirements
6. You'll be automatically logged in as CEO

