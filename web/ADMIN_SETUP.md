# Admin Account Setup Guide

## For Theo - Admin Account Creation

Once you have your Supabase project set up with the environment variables, you can create your admin account by:

### Option 1: Through the Login Page (Recommended)
1. Go to `/login`
2. Enter your name: "Theo"
3. Click "Create Account"
4. The system will automatically create your account with admin privileges

### Option 2: Manual Database Setup
If you need to manually set up the admin account:

1. **Set up environment variables** in `.env.local`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Run the admin creation script**:
```bash
cd web
node scripts/create-admin.js
```

3. **Or manually create in Supabase Dashboard**:
   - Go to Authentication > Users
   - Create a new user with email: `theo@syntra.local`
   - Set password: `admin123` (temporary)
   - In the profiles table, set role to 'admin'

### Login Details
- **Name**: Theo
- **Email**: theo@syntra.local (auto-generated)
- **Password**: Will be set automatically (you can change it later)

### Features Available to Admin
- Full access to all dashboard features
- Workflow creation and management
- Analytics and reporting
- User management (when implemented)
- System configuration

### Security Notes
- The simplified name-based login is for demo purposes
- In production, implement proper password management
- Consider adding 2FA for admin accounts
- Regularly rotate API keys and secrets

## Next Steps
1. Set up your Supabase project
2. Configure environment variables
3. Create your admin account
4. Start building your AI workflows!
