import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { IntegrationService } from "../services/integration.service";
import { WebhookService } from "../services/webhook.service";

const configSchema = z.object({
    platform: z.enum(["SHOPIFY", "WOOCOMMERCE"]),
    api_url: z.string().url().optional(),
    api_key: z.string().optional(),
    access_token: z.string().optional(),
});

export const saveConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { platform, api_url, api_key, access_token } = configSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const existingConfig = await prisma.integrationConfig.findFirst({
            where: { organization_id: organizationId, platform }
        });

        let config;
        if (existingConfig) {
            config = await prisma.integrationConfig.update({
                where: { id: existingConfig.id },
                data: { api_url, api_key, access_token, is_active: true }
            });
        } else {
            config = await prisma.integrationConfig.create({
                data: { organization_id: organizationId, platform, api_url, api_key, access_token, is_active: true }
            });
        }

        res.json(config);
    } catch (error) {
        next(error);
    }
};

export const getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const configs = await prisma.integrationConfig.findMany({
            where: { organization_id: organizationId }
        });
        res.json(configs);
    } catch (error) {
        next(error);
    }
};

export const triggerSync = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { platform, type } = req.body; // type: "PRODUCTS" | "ORDERS"
        const organizationId = req.organizationId!;

        if (type === "PRODUCTS") {
            await IntegrationService.syncProducts(organizationId, platform);
        } else if (type === "ORDERS") {
            await IntegrationService.syncOrders(organizationId, platform);
        }

        res.json({ message: "Sync started" });
    } catch (error) {
        next(error);
    }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { platform } = req.params;
        const topic = req.headers["x-shopify-topic"] || req.headers["x-wc-webhook-topic"] || "unknown";

        // In real world, verify HMAC here using req.rawBody

        await WebhookService.handleWebhook(platform, String(topic), req.body);

        res.status(200).send("OK");
    } catch (error) {
        next(error);
    }
};
