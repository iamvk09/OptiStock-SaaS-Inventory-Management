import { Request, Response } from "express";
import prisma from "../prisma";
import { createClient } from "@supabase/supabase-js";

export const validateConnections = async (req: Request, res: Response) => {
    const results: any = {
        database: { status: "pending" },
        storage: { status: "pending" }
    };

    // 1. Validate Prisma (Database)
    try {
        await prisma.$connect();
        const userCount = await prisma.user.count();
        results.database = { status: "success", message: `Connected! Found ${userCount} users.` };
    } catch (error: any) {
        results.database = { status: "error", message: error.message };
    }

    // 2. Validate Supabase Storage
    try {
        const supabaseUrl = process.env.SUPABASE_URL || "";
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

        if (supabaseUrl.includes("placeholder")) {
            results.storage = { status: "success", message: "Placeholder URL detected. Skipping network check." };
        } else {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data, error } = await supabase.storage.listBuckets();
            if (error) {
                results.storage = { status: "warning", message: error.message };
            } else {
                results.storage = { status: "success", message: `Connected! Found ${data?.length || 0} buckets.` };
            }
        }
    } catch (error: any) {
        results.storage = { status: "error", message: error.message };
    }

    res.json(results);
};
