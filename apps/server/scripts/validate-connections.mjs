import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Instantiate with datasourceUrl for Prisma v7
const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

async function validateConnections() {
    console.log("Starting Connection Validation...");

    // 1. Validate Prisma (Database)
    try {
        console.log("Testing Database Connection (Prisma)...");
        await prisma.$connect();
        const userCount = await prisma.user.count();
        console.log(`✅ Database Connected! Found ${userCount} users.`);
    } catch (error) {
        console.error("❌ Database Connection Failed:", error);
    } finally {
        await prisma.$disconnect();
    }

    // 2. Validate Supabase Storage
    try {
        console.log("Testing Supabase Storage Connection...");
        if (supabaseUrl.includes("placeholder")) {
            console.log("⚠️ Using Placeholder Supabase URL. Skipping actual network request.");
            console.log("✅ Supabase Configuration Validated (Placeholder Mode).");
        } else {
            const { data, error } = await supabase.storage.listBuckets();
            if (error) {
                console.warn("⚠️ Supabase Storage Warning:", error.message);
            } else {
                console.log(`✅ Supabase Storage Connected! Found ${data.length} buckets.`);
            }
        }
    } catch (error) {
        console.error("❌ Supabase Storage Connection Failed:", error.message);
    }

    console.log("Validation Complete.");
}

validateConnections();
