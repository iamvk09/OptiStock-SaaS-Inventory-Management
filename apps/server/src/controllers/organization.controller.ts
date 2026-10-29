import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../prisma";

const createOrgSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
});

export const createOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, slug } = createOrgSchema.parse(req.body);
        const userId = req.user!.id;

        const existing = await prisma.organization.findUnique({ where: { slug } });
        if (existing) {
            return res.status(400).json({ message: "Slug already taken" });
        }

        const organization = await prisma.organization.create({
            data: {
                name,
                slug,
                users: {
                    create: {
                        user_id: userId,
                        role: "OWNER",
                    },
                },
            },
        });

        res.status(201).json(organization);
    } catch (error) {
        next(error);
    }
};

export const getOrganizations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const organizations = await prisma.organization.findMany({
            where: {
                users: {
                    some: {
                        user_id: userId,
                    },
                },
            },
        });
        res.json(organizations);
    } catch (error) {
        next(error);
    }
};

export const getOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        // Middleware already checked access if we use requireOrganization, but here we might just want to fetch metadata
        // For now let's assume this is a public endpoint or protected by auth + membership check
        // Since we are fetching by ID, we should check if user is member

        const membership = await prisma.userOrganizationRole.findUnique({
            where: {
                user_id_organization_id: {
                    user_id: req.user!.id,
                    organization_id: id
                }
            }
        });

        if (!membership) {
            return res.status(403).json({ message: "Access denied" });
        }

        const organization = await prisma.organization.findUnique({
            where: { id },
        });

        res.json(organization);
    } catch (error) {
        next(error);
    }
};
