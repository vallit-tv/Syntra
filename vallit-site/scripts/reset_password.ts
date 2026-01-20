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

async function sendPasswordReset() {
    const EMAIL = 'theorei@icloud.com';
    const REDIRECT_URL = 'https://vallit.net/auth/callback?next=/update-password';

    try {
        console.log(`Sending password reset email to ${EMAIL}...`);
        console.log(`Redirect URL: ${REDIRECT_URL}`);

        // Use generateLink to create a password recovery link
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: EMAIL,
            options: {
                redirectTo: REDIRECT_URL
            }
        });

        if (error) {
            console.error('❌ Error generating password reset link:', error.message);
            process.exit(1);
        }

        console.log('✅ Password reset link generated!');
        console.log('');
        console.log('='.repeat(60));
        console.log('IMPORTANT: Share this link with the user:');
        console.log('='.repeat(60));
        console.log(data.properties?.action_link);
        console.log('='.repeat(60));
        console.log('');
        console.log('Note: The link contains a one-time token. Once clicked, it will log the user in and redirect to /update-password.');

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

sendPasswordReset();
