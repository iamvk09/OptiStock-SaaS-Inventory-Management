import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../prisma";

// Standard IP-based rate limiter
export const ipRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

// Simple in-memory store for API key rate limiting
// In production, replace this with Redis
const keyUsageStore = new Map<string, { count: number; windowStart: number }>();
const WINDOW_SIZE_MS = 60 * 1000; // 1 minute
const DEFAULT_LIMIT = 60; // 60 requests per minute

export const apiKeyRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
        return ipRateLimiter(req, res, next);
    }

    try {
        const keyRecord = await prisma.apiKey.findUnique({
            where: { key_hash: apiKey }
        });

        if (!keyRecord) {
            return res.status(401).json({ error: "Invalid API Key" });
        }

        // Rate Limiting Logic
        const now = Date.now();
        const usage = keyUsageStore.get(apiKey) || { count: 0, windowStart: now };

        if (now - usage.windowStart > WINDOW_SIZE_MS) {
            // Reset window
            usage.count = 1;
            usage.windowStart = now;
        } else {
            usage.count++;
        }

        keyUsageStore.set(apiKey, usage);

        const limit = keyRecord.rate_limit || DEFAULT_LIMIT;

        if (usage.count > limit) {
            return res.status(429).json({
                error: "Rate limit exceeded",
                retryAfter: Math.ceil((usage.windowStart + WINDOW_SIZE_MS - now) / 1000)
            });
        }

        // Update last used asynchronously
        prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { last_used_at: new Date() }
        }).catch(console.error);

        req.organizationId = keyRecord.organization_id;
        next();
    } catch (error) {
        next(error);
    }
};
