import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { verifyToken } from "../utils/jwt";
import prisma from "../prisma";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        let supabaseUser;

        if (token === "demo-token") {
            supabaseUser = { email: "demo@optistock.com" };
        } else {
            // Try local JWT first
            const localPayload = verifyToken(token) as any;
            if (localPayload && localPayload.userId) {
                // It's a local token
                const user = await prisma.user.findUnique({ where: { id: localPayload.userId } });
                if (user) {
                    req.user = user;
                    const orgIdHeader = req.headers['x-organization-id'] as string;
                    if (orgIdHeader) {
                        req.organizationId = orgIdHeader;
                    }
                    return next();
                }
            }

            // Fallback to Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (error || !user) {
                return res.status(401).json({ message: "Unauthorized: Invalid token" });
            }
            supabaseUser = user;
        }

        // Find or sync user in local DB
        let user = await prisma.user.findFirst({
            where: { email: supabaseUser.email }
        });

        if (!user && supabaseUser.email) {
            // Lazy Sync: Auto-create user if they exist in Supabase but not locally
            console.log(`Lazy syncing user ${supabaseUser.email} from Supabase to local DB...`);
            user = await prisma.user.create({
                data: {
                    email: supabaseUser.email,
                    name: supabaseUser.user_metadata?.name || 'New User',
                    password_hash: 'managed-by-supabase', // Placeholder as auth is handled by Supabase
                }
            });
        }

        if (user) {
            req.user = user;
            // Also attach organizationId if present in headers or user context
            const orgIdHeader = req.headers['x-organization-id'] as string;
            if (orgIdHeader) {
                req.organizationId = orgIdHeader; // Assuming req.organizationId is string based on previous usage
            }
        }

        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
