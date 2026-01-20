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
                // strip quotes
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

async function forceSetPassword() {
    const EMAIL = 'theorei@icloud.com';
    // Get password from command line arg or use default
    const args = process.argv.slice(2);
    const customPassword = args[0];

    if (!customPassword) {
        console.error('❌ Please provide a password as an argument.');
        console.error('Usage: npx ts-node --esm scripts/force_password.ts "YourNewPassword"');
        process.exit(1);
    }

    const TEMP_PASSWORD = customPassword;

    try {
        console.log(`Forcefully setting password for ${EMAIL}...`);

        // 1. Find user ID
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const user = users.users.find(u => u.email === EMAIL);

        if (!user) {
            console.error('❌ User not found. Please run the invite script first to create the user record.');
            process.exit(1);
        }

        const userId = user.id;
        console.log(`Found user ID: ${userId}`);

        // 2. Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: TEMP_PASSWORD,
            email_confirm: true // Auto-confirm email if not already
        });

        if (updateError) {
            console.error('❌ Error updating password:', updateError.message);
            process.exit(1);
        }

        console.log('✅ Password successfully updated!');
        console.log('');
        console.log('='.repeat(50));
        console.log('LOGIN CREDENTIALS:');
        console.log('Email:    ', EMAIL);
        console.log('Password: ', TEMP_PASSWORD);
        console.log('='.repeat(50));
        console.log('');
        console.log('You can now log in directly at /login without checking email.');

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

forceSetPassword();
