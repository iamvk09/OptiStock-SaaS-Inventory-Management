"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
require("dotenv/config");
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
async function verifyStorage() {
    console.log("Verifying Supabase Storage...");
    if (supabaseUrl.includes("placeholder")) {
        console.log("⚠️ Placeholder URL detected. Skipping.");
        return;
    }
    const buckets = ["products", "avatars", "documents"];
    for (const bucket of buckets) {
        const { data, error } = await supabase.storage.getBucket(bucket);
        if (error) {
            console.log(`❌ Bucket '${bucket}' missing or inaccessible. Attempting to create...`);
            const { error: createError } = await supabase.storage.createBucket(bucket, {
                public: true
            });
            if (createError) {
                console.error(`   Failed to create '${bucket}':`, createError.message);
            }
            else {
                console.log(`   ✅ Created bucket '${bucket}'.`);
            }
        }
        else {
            console.log(`✅ Bucket '${bucket}' exists.`);
        }
    }
}
verifyStorage();
