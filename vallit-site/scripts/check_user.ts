
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

const env = loadEnv(path.resolve(__dirname, '../.env.local'));
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    console.log("Checking user metadata...");
    const { data: { users } } = await supabase.auth.admin.listUsers();

    // Check specific email
    const email = "theorei@icloud.com";
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (user) {
        console.log(`User Found: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log("Metadata:", JSON.stringify(user.user_metadata, null, 2));
    } else {
        console.log("User not found via listUsers + find");
    }
}

check();
