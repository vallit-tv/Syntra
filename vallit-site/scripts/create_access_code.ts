import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        return {};
    }
}

const envPath = path.resolve(__dirname, '../.env.local');
const env = loadEnv(envPath);

const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAccessCode() {
    const args = process.argv.slice(2);
    const email = args[0];

    if (!email) {
        console.error('Usage: npx ts-node --esm scripts/create_access_code.ts <email>');
        process.exit(1);
    }

    try {
        console.log(`Setting up Access Code for ${email}...`);

        let userId: string;

        // 1. Get or Create User
        const { data: usersData } = await supabase.auth.admin.listUsers();
        let user = usersData?.users.find(u => u.email === email);

        if (!user) {
            console.log('User not found. Creating user...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password: 'temp-password-' + Math.random().toString(36),
                email_confirm: true
            });
            if (createError) throw createError;
            user = newUser.user;
            console.log(`Created user: ${user.id}`);
        } else {
            console.log(`Found existing user: ${user.id}`);
        }

        userId = user.id;

        // 2. Generate 6-digit Code
        const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Store in Metadata
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
                ...user.user_metadata,
                setup_required: true,
                access_code: accessCode
            }
        });

        if (updateError) throw updateError;

        console.log('');
        console.log('✅ Access Code Generated!');
        console.log('='.repeat(50));
        console.log(`Email:       ${email}`);
        console.log(`Access Code: ${accessCode}`);
        console.log('='.repeat(50));
        console.log('');
        console.log('The user can now go to /login, enter their email, and the system will ask for this code.');

    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

createAccessCode();
