
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
                // Join back the rest in case value has =
                let value = parts.slice(1).join('=').trim();
                // Remove quotes if present
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
    console.log('Env loaded:', Object.keys(env));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function applyMigration() {
    const migrationPath = path.resolve(__dirname, '../../migrations/admin_setup.sql');

    try {
        // 1. Check if companies table exists
        const { error: checkError } = await supabase.from('companies').select('*').limit(1);

        if (checkError && checkError.code === '42P01') { // undefined_table
            console.log('Companies table missing. Cannot apply schema via JS client.');
            console.log('Please run migrations/admin_setup.sql in Supabase SQL Editor.');
            process.exit(1);
        }

        console.log('Companies table exists (or at least queryable). Checking seed data...');

        // 2. Check for Syntra
        const { data: syntra } = await supabase.from('companies').select('*').eq('slug', 'syntra');
        if (syntra && syntra.length > 0) {
            console.log('✅ Syntra company already exists.');
        } else {
            console.log('Creating Syntra company via API...');
            const { error: insertError } = await supabase.from('companies').insert({ name: 'Syntra', slug: 'syntra' });
            if (insertError) {
                console.error('❌ Error inserting Syntra:', insertError);
                process.exit(1);
            }
            console.log('✅ Syntra company created.');
        }

        console.log('Migration check complete. Note: Triggers/Functions must be applied manually via SQL if not present.');

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

applyMigration();
