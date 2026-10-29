import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export const requireOrganization = async (req: Request, res: Response, next: NextFunction) => {
    const organizationId = req.headers["x-organization-id"] as string;

    if (!organizationId) {
        return res.status(400).json({ message: "Organization ID required" });
    }

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const membership = await prisma.userOrganizationRole.findUnique({
            where: {
                user_id_organization_id: {
                    user_id: req.user.id,
                    organization_id: organizationId,
                },
            },
        });

        if (!membership) {
            return res.status(403).json({ message: "Access denied to this organization" });
        }

        req.organizationId = organizationId;
        next();
    } catch (error) {
        next(error);
    }
};
