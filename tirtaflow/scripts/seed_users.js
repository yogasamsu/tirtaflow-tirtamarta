// Seed Users
// Run with: node scripts/seed_users.js

const { createClient } = require('@supabase/supabase-js');

// REPLACE THIS WITH YOUR SERVICE ROLE KEY temporarily
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'PLACEHOLDER_SERVICE_ROLE_KEY';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tmzwdjtgsjcpycrhwsbe.supabase.co';

if (SERVICE_ROLE_KEY === 'PLACEHOLDER_SERVICE_ROLE_KEY') {
    console.error("Please set SUPABASE_SERVICE_ROLE_KEY env var.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const users = [
    { email: 'admin@pdam.com', password: 'password123', role: 'admin', full_name: 'Administrator' },
    { email: 'direktur@pdam.com', password: 'password123', role: 'direktur', full_name: 'Bapak Direktur' },
    { email: 'umum@pdam.com', password: 'password123', role: 'umum', full_name: 'Staff Bagian Umum' },
    { email: 'operasional@pdam.com', password: 'password123', role: 'operasional', full_name: 'Kepala Operasional' },
];

async function seed() {
    for (const u of users) {
        console.log(`Creating user: ${u.email}...`);
        const { data, error } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { full_name: u.full_name }
        });

        if (error) {
            console.error(`Error creating ${u.email}:`, error.message);
        } else {
            console.log(`User created: ${u.email} (ID: ${data.user.id})`);

            // Create profile
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                email: u.email,
                full_name: u.full_name,
                role: u.role
            });

            if (profileError) {
                // Ignore if already exists (duplicate key)
                if (profileError.code === '23505') {
                    console.log(`Profile for ${u.email} already exists.`);
                } else {
                    console.error(`Profile error for ${u.email}:`, profileError.message);
                }
            }
            else console.log(`Profile linked for ${u.email}`);
        }
    }
}

seed();
