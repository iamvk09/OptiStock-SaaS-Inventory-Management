
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    const email = 'demo2@optistock.com';
    const password = 'password123';

    console.log(`Attempting login for ${email}...`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Supabase Login Failed:', error.message);
        return;
    }

    console.log('Supabase Login Success. Token obtained.');
    const token = data.session.access_token;

    console.log('Testing Backend Sync...');
    try {
        const res = await axios.post('http://localhost:3000/api/auth/sync', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Backend Sync Success:', res.data);
    } catch (e: any) {
        console.error('Backend Sync Failed:', e.response?.data || e.message);
    }
}

testLogin();
