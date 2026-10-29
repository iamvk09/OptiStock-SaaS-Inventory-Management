import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export const getAllOrganizations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizations = await prisma.organization.findMany({
            include: {
                _count: {
                    select: { users: true, warehouses: true }
                }
            },
            orderBy: { created_at: "desc" }
        });
        res.json(organizations);
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                organizations: {
                    include: { organization: true }
                }
            },
            orderBy: { created_at: "desc" }
        });
        res.json(users);
    } catch (error) {
        next(error);
    }
};
