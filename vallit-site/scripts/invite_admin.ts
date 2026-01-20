
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Manually parse .env.local to avoid adding dependencies
function loadEnv(filePath: string) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const env: Record<string, string> = {};
        for (const line of lines) {
            if (!line || line.startsWith('#')) continue;
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let value = parts.slice(1).join('=').trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        }
        return env;
    } catch (err) {
        console.error(`Failed to load env from ${filePath}:`, err);
        return {};
    }
}

const envPath = path.resolve(__dirname, '../.env.local');
const env = loadEnv(envPath);

const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function inviteAdmin() {
    const EMAIL = 'theorei@icloud.com';

    try {
        // 1. Get Syntra Company ID
        const { data: companies, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('slug', 'syntra')
            .single();

        if (companyError || !companies) {
            console.error('❌ Could not find Syntra company. Please ensure migration script was run.', companyError);
            process.exit(1);
        }

        const companyId = companies.id;
        console.log(`Found Syntra company ID: ${companyId}`);

        // 2. Invite User
        console.log(`Inviting ${EMAIL}...`);
        // Note: inviteUserByEmail might return error if user already exists
        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(EMAIL, {
            data: {
                company_id: companyId,
                full_name: 'Admin User',
                role: 'admin'
            },
            redirectTo: 'http://localhost:3000/update-password' // Redirect to new page
        });

        let userId: string | undefined;

        if (inviteError) {
            console.log('Invite returned error:', inviteError.message);
            // Check if user already exists
            if (inviteError.message.includes('already_registered') || inviteError.status === 422) {
                console.log('User likely already exists. Fetching user...');
                // Note: listUsers requires service role, which we have.
                // But we can't filter by email effectively in listUsers easily without pagination, 
                // OR we can just try to get by email if we had a method. `admin.getUserById` needs ID.
                // `admin.listUsers` is the way.
                const { data: users, error: listError } = await supabase.auth.admin.listUsers();
                if (users && users.users) {
                    const found = users.users.find(u => u.email === EMAIL);
                    if (found) {
                        userId = found.id;
                        console.log(`User already exists with ID: ${userId}`);
                        // Update metadata if needed?
                        await supabase.auth.admin.updateUserById(userId, {
                            user_metadata: { company_id: companyId, role: 'admin' }
                        });
                    }
                }
            }
        } else {
            console.log('✅ Invite sent successfully.');
            userId = inviteData.user.id;
        }

        if (!userId) {
            console.error('❌ Failed to determine User ID.');
            process.exit(1);
        }

        // 3. Ensure public.users record exists
        console.log(`Ensuring public.users record for ${userId}...`);

        // Check if exists
        const { data: publicUser, error: publicCheckError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!publicUser) {
            console.log('Creating public.users record...');
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    name: EMAIL, // Temporary name
                    company_id: companyId,
                    updated_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('❌ Error creating public user:', insertError);
            } else {
                console.log('✅ Public user record created.');
            }
        } else {
            console.log('✅ Public user record already exists.');
            // Update company_id just in case
            if (publicUser.company_id !== companyId) {
                console.log('Updating company_id...');
                await supabase.from('users').update({ company_id: companyId }).eq('id', userId);
            }
        }

        console.log('Admin setup complete.');

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

inviteAdmin();
