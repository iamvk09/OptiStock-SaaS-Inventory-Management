import { createClient } from "@supabase/supabase-js";

// These should be provided by the consuming app via environment variables
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

export const createSupabaseClient = (url: string, key: string) => {
    return createClient(url, key);
};

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
