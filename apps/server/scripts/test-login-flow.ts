
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const port = process.env.PORT || 3000;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    const email = 'demo@optistock.com';
    const password = 'password123';

    console.log('1. Attempting Supabase Login...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Supabase Login Failed:', error.message);
        return;
    }

    console.log('Supabase Login Success! Token received.');
    const token = data.session?.access_token;

    if (!token) {
        console.error('No access token in session.');
        return;
    }

    console.log('2. Attempting Backend Sync...');
    try {
        const res = await axios.post(`http://localhost:${port}/api/auth/sync`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Backend Sync Success!');
        console.log('User:', res.data.user.email);
        console.log('Org:', res.data.organization?.name);
    } catch (err: any) {
        console.error('Backend Sync Failed:', err.response?.status, err.response?.data || err.message);
    }
}

testLogin();
