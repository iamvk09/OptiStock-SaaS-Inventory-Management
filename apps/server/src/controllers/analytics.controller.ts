import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;

        const [
            productCount,
            lowStockCount,
            totalStockValue,
            recentActivity
        ] = await Promise.all([
            prisma.product.count({ where: { organization_id: organizationId } }),
            prisma.productVariant.count({
                where: {
                    product: { organization_id: organizationId },
                    stock_levels: {
                        some: {
                            quantity: { lte: 10 } // Hardcoded threshold for now, or use variant.low_stock_threshold
                        }
                    }
                }
            }),
            // This is an approximation. Ideally we sum (quantity * cost_price)
            prisma.stockLevel.findMany({
                where: { warehouse: { organization_id: organizationId } },
                include: { variant: true }
            }).then(levels => levels.reduce((acc, level) => acc + (level.quantity * Number(level.variant.cost_price)), 0)),
            prisma.auditLog.findMany({
                where: { organization_id: organizationId },
                orderBy: { created_at: "desc" },
                take: 5,
                include: { user: true }
            })
        ]);

        res.json({
            productCount,
            lowStockCount,
            totalStockValue,
            recentActivity
        });
    } catch (error) {
        next(error);
    }
};
