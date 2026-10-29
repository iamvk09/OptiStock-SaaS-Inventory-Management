import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { z } from "zod";

const updateConfigSchema = z.object({
    layout: z.any(), // JSON
    widgets: z.any().optional(), // JSON
});

export const getDashboardConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const userId = req.user!.id;

        let config = await prisma.userDashboardConfig.findUnique({
            where: {
                user_id_organization_id: {
                    user_id: userId,
                    organization_id: organizationId,
                },
            },
        });

        if (!config) {
            // Create default config if not exists
            config = await prisma.userDashboardConfig.create({
                data: {
                    user_id: userId,
                    organization_id: organizationId,
                    layout: [], // Default empty layout
                    widgets: {},
                },
            });
        }

        res.json(config);
    } catch (error) {
        next(error);
    }
};

export const updateDashboardConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { layout, widgets } = updateConfigSchema.parse(req.body);
        const organizationId = req.organizationId!;
        const userId = req.user!.id;

        const config = await prisma.userDashboardConfig.upsert({
            where: {
                user_id_organization_id: {
                    user_id: userId,
                    organization_id: organizationId,
                },
            },
            update: {
                layout,
                widgets,
            },
            create: {
                user_id: userId,
                organization_id: organizationId,
                layout,
                widgets,
            },
        });

        res.json(config);
    } catch (error) {
        next(error);
    }
};
