import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import crypto from "crypto";
import prisma from "../prisma";

const createApiKeySchema = z.object({
    name: z.string().min(1),
    scopes: z.array(z.string()).optional(),
    rate_limit: z.number().int().positive().optional(),
});

export const createApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, scopes, rate_limit } = createApiKeySchema.parse(req.body);
        const organizationId = req.organizationId!;
        const userId = req.user!.id;

        const key = `sk_${crypto.randomBytes(24).toString("hex")}`;
        const hashedKey = crypto.createHash("sha256").update(key).digest("hex");

        const apiKey = await prisma.apiKey.create({
            data: {
                organization_id: organizationId,
                user_id: userId,
                name,
                key_hash: hashedKey,
                prefix: key.substring(0, 7),
                scopes: scopes || ["read"],
                rate_limit: rate_limit || 1000,
            },
        });

        // Return the raw key only once
        res.status(201).json({ ...apiKey, key });
    } catch (error) {
        next(error);
    }
};

export const getApiKeys = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const keys = await prisma.apiKey.findMany({
            where: { organization_id: organizationId },
            select: {
                id: true,
                name: true,
                prefix: true,
                scopes: true,
                rate_limit: true,
                last_used_at: true,
                created_at: true,
            },
        });
        res.json(keys);
    } catch (error) {
        next(error);
    }
};

export const revokeApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        await prisma.apiKey.delete({
            where: { id, organization_id: organizationId },
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
