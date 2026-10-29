const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://kugbpgvijmkxecvrygfd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1Z2JwZ3Zpam1reGVjdnJ5Z2ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI0MDUxMywiZXhwIjoyMDc5ODE2NTEzfQ.WR6Q-ghUDnxaChp3abFhJllYCPRULcSBBW1oNtOouKk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAuthUser() {
    const email = 'alice@demo.com';
    const password = 'password123';

    console.log(`Creating user ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Alice Admin' }
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully:', data.user.id);
    }
}

createAuthUser();
