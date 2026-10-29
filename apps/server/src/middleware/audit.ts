import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export const logActivity = (action: string, entityType: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const originalSend = res.send;

        res.on("finish", async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const userId = req.user?.id;
                    const organizationId = req.organizationId;

                    if (userId && organizationId) {
                        await prisma.auditLog.create({
                            data: {
                                organization_id: organizationId,
                                user_id: userId,
                                action,
                                entity: entityType,
                                entity_id: req.params.id || "N/A", // Best effort
                                details: {
                                    method: req.method,
                                    path: req.path,
                                    body: req.method !== "GET" ? req.body : undefined,
                                },
                                ip_address: req.ip,
                                user_agent: req.get("User-Agent"),
                            },
                        });
                    }
                } catch (error) {
                    console.error("Failed to create audit log:", error);
                }
            }
        });

        next();
    };
};
