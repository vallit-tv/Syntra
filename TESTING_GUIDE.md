# Multi-Company System Testing Guide

## Prerequisites

Before testing, ensure you have:
1. ✅ Run the database migration `database_migration_companies.sql` in Supabase SQL Editor
2. ✅ n8n instance running (optional for workflow testing)
3. ✅ Environment variables set (`N8N_URL` and `N8N_API_KEY`)

## Step 1: Run Database Migration

```sql
-- In Supabase SQL Editor, run:
-- /Users/theoreichert/Documents/Projects/Syntra/database_migration_companies.sql
```

This will create the `companies` table and update `users` and `workflow_activations` tables.

## Step 2: Access Admin Panel

1. **Login as Theo (Admin)**
   - Navigate to `/login`
   - Username: `Theo`
   - Password: *(your existing password)*
   - **Expected:** Redirect to `/admin` (Admin Panel)

2. **Verify Admin Dashboard**
   - Should see "Admin Panel" in sidebar logo
   - Navigation: Workflows, Users, System Status, Analytics, Companies, n8n
   - Should see system overview

## Step 3: Create a Test Company

1. **Navigate to Admin Companies**
   - Click "Companies" in admin sidebar
   - Or go to `/admin/companies`

2. **Create Company**
   - Click "Add Company" button
   - Fill in:
     - **Name:** `Test Corporation`
     - **Slug:** `test-corp` (lowercase, hyphens only)
   - Click "Create Company"
   - **Expected:** Company created successfully

3. **Verify Company Created**
   - Should see "Test Corporation" in the companies list
   - Can click on company name to view details

## Step 4: Assign a CEO

1. **Assign CEO to Test Corporation**
   - In companies list, click "Assign CEO" for Test Corporation
   - Or in company detail page, click "Assign CEO"
   - Fill in:
     - **CEO Name:** `Alice`
   - Click "Assign CEO"
   - **Expected:** CEO created and assigned to company

2. **Verify CEO Created**
   - In Admin → Users, should see "Alice" with role "CEO"
   - In company detail page, should see Alice in company users list

## Step 5: Test CEO Login

1. **Logout from Admin**
   - Click user menu (top right)
   - Click "Logout"

2. **Login as Alice (CEO)**
   - Navigate to `/login`
   - Username: `Alice`
   - **First time:** Will be prompted to set password
   - Set password and login
   - **Expected:** Redirect to `/company/dashboard` (CEO Dashboard)

3. **Verify CEO Dashboard**
   - Should see "Test Corporation" in sidebar logo
   - Navigation: Dashboard, Workflows, Team, Settings
   - Should see company overview with stats

## Step 6: Activate a Workflow (CEO)

**Note:** This requires workflows to be synced from n8n by admin first.

1. **As Admin, Sync Workflows**
   - Login as Theo (Admin)
   - Go to Admin → Workflows
   - Click "Sync with n8n"
   - Mark at least one workflow as **Public** (toggle switch)

2. **As CEO, Activate Workflow**
   - Login as Alice (CEO)
   - Go to Workflows (`/company/workflows`)
   - Click "Activate" on a public workflow
   - **Expected:** Workflow activated for company

3. **Configure API Keys**
   - Click on activated workflow to view details
   - Enter API keys for required services (e.g., Notion, OpenAI)
   - Click "Save" for each service
   - **Expected:** API keys saved successfully

## Step 7: Add a Worker (CEO)

1. **As CEO, Add Team Member**
   - In CEO dashboard, go to Team (`/company/workers`)
   - Click "Add Team Member"
   - Fill in:
     - **Name:** `Bob`
   - Click "Add Team Member"
   - **Expected:** Worker created and assigned to Test Corporation

2. **Verify Worker Created**
   - Should see Bob in team members list
   - In Admin → Users, should see "Bob" with role "Worker"

## Step 8: Test Worker Login

1. **Logout from CEO**
   - Click user menu → Logout

2. **Login as Bob (Worker)**
   - Navigate to `/login`
   - Username: `Bob`
   - **First time:** Will be prompted to set password
   - Set password and login
   - **Expected:** Redirect to `/dashboard` (Worker Dashboard)

3. **Verify Worker Dashboard**
   - Should see "Syntra" in sidebar (not company name)
   - Should **only** see workflows activated by Test Corporation
   - Cannot activate new workflows (only CEO can)
   - Can view workflow details and execution history

## Step 9: Test Data Isolation

1. **Create Second Company**
   - Login as Theo (Admin)
   - Go to Admin → Companies
   - Create company:
     - **Name:** `Acme Inc`
     - **Slug:** `acme-inc`

2. **Assign CEO to Acme**
   - Assign CEO named `Charlie` to Acme Inc

3. **Login as Charlie**
   - Login as Charlie (CEO of Acme Inc)
   - Go to Workflows
   - **Expected:** No workflows activated yet
   - Cannot see Test Corporation's workflows or users

4. **Activate Different Workflow**
   - Activate a different workflow than Test Corporation
   - Add worker named `Diana` to Acme Inc

5. **Verify Isolation**
   - Login as Bob (Test Corp worker)
     - Should **only** see Test Corp's activated workflows
   - Login as Diana (Acme Inc worker)
     - Should **only** see Acme Inc's activated workflows
   - **Expected:** Complete data isolation between companies

## Step 10: Test Admin Features

1. **Admin View All Companies**
   - Login as Theo (Admin)
   - Go to Admin → Companies
   - **Expected:** See both Test Corporation and Acme Inc

2. **Admin View All Users**
   - Go to Admin → Users
   - **Expected:** See all users (Theo, Alice, Bob, Charlie, Diana)

3. **Admin View System Status**
   - Go to Admin → System Status
   - **Expected:** See n8n connection status, workflow stats

4. **Admin Access n8n**
   - Go to Admin → n8n
   - **Expected:** See n8n connection status and "Open n8n Editor" button
   - Click button to open n8n in new tab

5. **Admin View Analytics**
   - Go to Admin → Analytics
   - **Expected:** See all workflow executions across all companies

## Expected Routing Behavior

| User Role | Login Redirects To | Dashboard Access |
|-----------|-------------------|------------------|
| Admin (Theo) | `/admin` | Can access everything |
| CEO (Alice, Charlie) | `/company/dashboard` | Only their company |
| Worker (Bob, Diana) | `/dashboard` | Only company-activated workflows |

## Verification Checklist

- [ ] Database migration runs without errors
- [ ] Admin can create companies
- [ ] Admin can assign CEOs to companies
- [ ] CEOs redirect to `/company/dashboard` on login
- [ ] CEOs can activate workflows for their company
- [ ] CEOs can add workers to their company
- [ ] Workers redirect to `/dashboard` on login
- [ ] Workers see only their company's activated workflows
- [ ] Workers cannot activate workflows
- [ ] Complete data isolation between companies
- [ ] Admin can view all companies and users
- [ ] Admin can access n8n directly
- [ ] Each role has appropriate permissions

## Troubleshooting

### Database Migration Errors

If you get UUID comparison errors:
```sql
-- Make sure you ran database_migration_companies.sql
-- Check that RLS policies use direct UUID comparisons (not text casts)
```

### Role-Based Access Issues

If redirects don't work:
1. Check `auth.py` has `is_admin()`, `is_ceo()`, `is_worker()` functions
2. Check `app.py` login routes return correct `redirect` URL
3. Check user's `role` field in database (should be 'admin', 'ceo', or 'worker')

### Company Not Assigned

If CEO/Worker can't see company data:
1. Check user's `company_id` in database
2. Run: `SELECT * FROM users WHERE name = 'Alice';`
3. Should have `company_id` set and `role = 'ceo'`

### Workflows Not Showing

For CEOs:
- Check workflow is marked as `is_public = true` by admin
- Check workflow activation in `workflow_activations` table

For Workers:
- Check CEO has activated workflow for company
- Check `workflow_activations.company_id` matches worker's company

## Success Criteria

✅ **Multi-Company System Working When:**
1. Admin can manage multiple companies independently
2. Each company has its own CEO
3. Each CEO can activate workflows and manage team
4. Workers see only their company's activated workflows
5. Complete data isolation between companies
6. Role-based routing works correctly
7. All three dashboards render properly

## Next Steps

After successful testing:
1. Deploy to production (Vercel)
2. Set up production n8n instance
3. Create production companies
4. Onboard first customers
5. Monitor system performance

## Support

If you encounter any issues:
1. Check browser console for JavaScript errors
2. Check Flask logs for backend errors
3. Verify database schema matches migration
4. Ensure all environment variables are set
5. Test n8n connectivity separately

