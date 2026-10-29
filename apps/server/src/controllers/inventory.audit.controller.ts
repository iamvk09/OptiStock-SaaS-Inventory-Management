import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { z } from "zod";

const createAuditSchema = z.object({
    warehouse_id: z.string().uuid(),
    notes: z.string().optional(),
});

const updateItemSchema = z.object({
    product_variant_id: z.string().uuid(),
    counted_quantity: z.number().int().nonnegative(),
    notes: z.string().optional(),
});

export const createAuditSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { warehouse_id, notes } = createAuditSchema.parse(req.body);
        const organizationId = req.organizationId!;
        const userId = req.user!.id;

        // Check if warehouse exists and belongs to org
        const warehouse = await prisma.warehouse.findFirst({
            where: { id: warehouse_id, organization_id: organizationId }
        });

        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        // Create audit session
        const audit = await prisma.inventoryAudit.create({
            data: {
                organization_id: organizationId,
                warehouse_id,
                status: "PENDING",
                notes,
                created_by: userId,
                started_at: new Date(),
            }
        });

        // Initialize audit items with current stock (snapshot)
        const currentStock = await prisma.stockLevel.findMany({
            where: { warehouse_id }
        });

        if (currentStock.length > 0) {
            await prisma.auditItem.createMany({
                data: currentStock.map(stock => ({
                    audit_id: audit.id,
                    product_variant_id: stock.product_variant_id,
                    expected_quantity: stock.quantity,
                    counted_quantity: null, // To be filled
                }))
            });
        }

        res.status(201).json(audit);
    } catch (error) {
        next(error);
    }
};

export const getAudits = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const audits = await prisma.inventoryAudit.findMany({
            where: { organization_id: organizationId },
            include: { warehouse: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(audits);
    } catch (error) {
        next(error);
    }
};

export const getAuditSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        const audit = await prisma.inventoryAudit.findFirst({
            where: { id, organization_id: organizationId },
            include: {
                items: {
                    include: { variant: { include: { product: true } } }
                },
                warehouse: true
            }
        });

        if (!audit) {
            return res.status(404).json({ message: "Audit session not found" });
        }

        res.json(audit);
    } catch (error) {
        next(error);
    }
};

export const updateAuditItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { product_variant_id, counted_quantity, notes } = updateItemSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const audit = await prisma.inventoryAudit.findFirst({
            where: { id, organization_id: organizationId }
        });

        if (!audit) return res.status(404).json({ message: "Audit session not found" });
        if (audit.status === "COMPLETED" || audit.status === "CANCELLED") {
            return res.status(400).json({ message: "Cannot update items in a finalized audit" });
        }

        // Update status to IN_PROGRESS if PENDING
        if (audit.status === "PENDING") {
            await prisma.inventoryAudit.update({
                where: { id },
                data: { status: "IN_PROGRESS" }
            });
        }

        // Upsert item
        // Check if item exists in audit
        const existingItem = await prisma.auditItem.findFirst({
            where: { audit_id: id, product_variant_id }
        });

        let item;
        if (existingItem) {
            item = await prisma.auditItem.update({
                where: { id: existingItem.id },
                data: {
                    counted_quantity,
                    discrepancy: counted_quantity - existingItem.expected_quantity,
                    notes,
                    counted_at: new Date()
                }
            });
        } else {
            // New item found during audit (was 0 expected)
            item = await prisma.auditItem.create({
                data: {
                    audit_id: id,
                    product_variant_id,
                    expected_quantity: 0,
                    counted_quantity,
                    discrepancy: counted_quantity, // counted - 0
                    notes,
                    counted_at: new Date()
                }
            });
        }

        res.json(item);
    } catch (error) {
        next(error);
    }
};

export const finalizeAudit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;
        const userId = req.user!.id;

        const audit = await prisma.inventoryAudit.findFirst({
            where: { id, organization_id: organizationId },
            include: { items: true }
        });

        if (!audit) return res.status(404).json({ message: "Audit session not found" });
        if (audit.status === "COMPLETED") return res.status(400).json({ message: "Audit already finalized" });

        // Process adjustments
        await prisma.$transaction(async (tx) => {
            for (const item of audit.items) {
                if (item.counted_quantity !== null && item.discrepancy !== 0) {
                    // Update stock level
                    // Find existing stock level
                    const stockLevel = await tx.stockLevel.findFirst({
                        where: {
                            warehouse_id: audit.warehouse_id,
                            product_variant_id: item.product_variant_id
                        }
                    });

                    if (stockLevel) {
                        await tx.stockLevel.update({
                            where: { id: stockLevel.id },
                            data: { quantity: item.counted_quantity }
                        });
                    } else {
                        await tx.stockLevel.create({
                            data: {
                                warehouse_id: audit.warehouse_id,
                                product_variant_id: item.product_variant_id,
                                quantity: item.counted_quantity
                            }
                        });
                    }

                    // Create transaction record
                    await tx.stockTransaction.create({
                        data: {
                            organization_id: organizationId,
                            type: "ADJUSTMENT",
                            quantity: Math.abs(item.discrepancy || 0), // Magnitude
                            previous_quantity: item.expected_quantity,
                            new_quantity: item.counted_quantity,
                            product_variant_id: item.product_variant_id,
                            to_warehouse_id: item.discrepancy! > 0 ? audit.warehouse_id : undefined, // In
                            from_warehouse_id: item.discrepancy! < 0 ? audit.warehouse_id : undefined, // Out
                            notes: `Audit Adjustment: ${audit.notes || ''} - Item Note: ${item.notes || ''}`,
                            created_by: userId,
                            reference_id: audit.id
                        }
                    });
                }
            }

            // Mark audit as completed
            await tx.inventoryAudit.update({
                where: { id },
                data: {
                    status: "COMPLETED",
                    completed_at: new Date()
                }
            });
        });

        res.json({ message: "Audit finalized and stock adjusted successfully" });
    } catch (error) {
        next(error);
    }
};
