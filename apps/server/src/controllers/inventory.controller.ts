import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { z } from "zod";

const transferSchema = z.object({
    from_warehouse_id: z.string().uuid(),
    to_warehouse_id: z.string().uuid(),
    product_variant_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
});

const reserveSchema = z.object({
    warehouse_id: z.string().uuid(),
    product_variant_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    expires_at: z.string().datetime().optional(), // ISO string
    reference_id: z.string().optional(),
    notes: z.string().optional(),
});

const freezeSchema = z.object({
    warehouse_id: z.string().uuid(),
    is_frozen: z.boolean(),
});

export const transferStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { from_warehouse_id, to_warehouse_id, product_variant_id, quantity, notes } = transferSchema.parse(req.body);
        const organizationId = req.organizationId!;
        const userId = req.user!.id;

        // Check if source warehouse is frozen
        const sourceWarehouse = await prisma.warehouse.findUnique({ where: { id: from_warehouse_id } });
        if (sourceWarehouse?.is_frozen) {
            return res.status(400).json({ message: "Source warehouse is frozen. Cannot transfer stock." });
        }

        // Check stock availability
        const stockLevel = await prisma.stockLevel.findFirst({
            where: { warehouse_id: from_warehouse_id, product_variant_id },
        });

        if (!stockLevel || stockLevel.quantity < quantity) {
            return res.status(400).json({ message: "Insufficient stock in source warehouse." });
        }

        // Perform transfer in transaction
        await prisma.$transaction(async (tx) => {
            // Deduct from source
            await tx.stockLevel.update({
                where: { id: stockLevel.id },
                data: { quantity: { decrement: quantity } },
            });

            // Add to destination
            const destStock = await tx.stockLevel.findFirst({
                where: { warehouse_id: to_warehouse_id, product_variant_id },
            });

            if (destStock) {
                await tx.stockLevel.update({
                    where: { id: destStock.id },
                    data: { quantity: { increment: quantity } },
                });
            } else {
                await tx.stockLevel.create({
                    data: {
                        warehouse_id: to_warehouse_id,
                        product_variant_id,
                        quantity,
                    },
                });
            }

            // Log transaction
            await tx.stockTransaction.create({
                data: {
                    organization_id: organizationId,
                    type: "TRANSFER",
                    quantity,
                    product_variant_id,
                    from_warehouse_id,
                    to_warehouse_id,
                    notes,
                    created_by: userId,
                },
            });
        });

        res.json({ message: "Stock transfer successful" });
    } catch (error) {
        next(error);
    }
};

export const reserveStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { warehouse_id, product_variant_id, quantity, expires_at, reference_id, notes } = reserveSchema.parse(req.body);
        const organizationId = req.organizationId!;

        // Check if warehouse is frozen
        const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouse_id } });
        if (warehouse?.is_frozen) {
            return res.status(400).json({ message: "Warehouse is frozen. Cannot reserve stock." });
        }

        // Check availability (Total - Reserved)
        const stockLevel = await prisma.stockLevel.findFirst({
            where: { warehouse_id, product_variant_id },
        });

        const existingReservations = await prisma.stockReservation.aggregate({
            where: {
                warehouse_id,
                product_variant_id,
                status: "ACTIVE",
            },
            _sum: { quantity: true },
        });

        const reservedQty = existingReservations._sum.quantity || 0;
        const availableQty = (stockLevel?.quantity || 0) - reservedQty;

        if (availableQty < quantity) {
            return res.status(400).json({ message: "Insufficient available stock for reservation." });
        }

        const reservation = await prisma.stockReservation.create({
            data: {
                organization_id: organizationId,
                warehouse_id,
                product_variant_id,
                quantity,
                expires_at: expires_at ? new Date(expires_at) : null,
                reference_id,
                notes,
            },
        });

        res.json(reservation);
    } catch (error) {
        next(error);
    }
};

export const toggleFreeze = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { warehouse_id, is_frozen } = freezeSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const warehouse = await prisma.warehouse.update({
            where: { id: warehouse_id, organization_id: organizationId },
            data: { is_frozen },
        });

        res.json(warehouse);
    } catch (error) {
        next(error);
    }
};

export const getInventoryLedger = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const { warehouse_id, product_variant_id, start_date, end_date } = req.query;

        const where: any = { organization_id: organizationId };

        if (warehouse_id) {
            where.OR = [
                { from_warehouse_id: String(warehouse_id) },
                { to_warehouse_id: String(warehouse_id) }
            ];
        }
        if (product_variant_id) where.product_variant_id = String(product_variant_id);
        if (start_date || end_date) {
            where.created_at = {};
            if (start_date) where.created_at.gte = new Date(String(start_date));
            if (end_date) where.created_at.lte = new Date(String(end_date));
        }

        const transactions = await prisma.stockTransaction.findMany({
            where,
            include: {
                from_warehouse: true,
                to_warehouse: true,
            },
            orderBy: { created_at: 'desc' },
        });

        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

const bulkUpdateSchema = z.object({
    updates: z.array(z.object({
        id: z.string().uuid(),
        quantity: z.number().int().nonnegative(),
    })),
});

export const bulkUpdateStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { updates } = bulkUpdateSchema.parse(req.body);
        const organizationId = req.organizationId!;
        const userId = req.user!.id;

        await prisma.$transaction(async (tx) => {
            for (const update of updates) {
                const stockLevel = await tx.stockLevel.findUnique({
                    where: { id: update.id },
                    include: { warehouse: true }
                });

                if (!stockLevel || stockLevel.warehouse.organization_id !== organizationId) {
                    continue; // Skip invalid or unauthorized
                }

                if (stockLevel.quantity !== update.quantity) {
                    await tx.stockLevel.update({
                        where: { id: update.id },
                        data: { quantity: update.quantity }
                    });

                    await tx.stockTransaction.create({
                        data: {
                            organization_id: organizationId,
                            type: "ADJUSTMENT",
                            quantity: Math.abs(update.quantity - stockLevel.quantity),
                            previous_quantity: stockLevel.quantity,
                            new_quantity: update.quantity,
                            product_variant_id: stockLevel.product_variant_id,
                            to_warehouse_id: update.quantity > stockLevel.quantity ? stockLevel.warehouse_id : undefined,
                            from_warehouse_id: update.quantity < stockLevel.quantity ? stockLevel.warehouse_id : undefined,
                            notes: "Bulk Editor Adjustment",
                            created_by: userId
                        }
                    });
                }
            }
        });

        res.json({ message: "Bulk update successful" });
    } catch (error) {
        next(error);
    }
};
