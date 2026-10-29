import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../prisma";

const createSOSchema = z.object({
    customer_id: z.string(),
    notes: z.string().optional(),
    items: z.array(z.object({
        product_variant_id: z.string(),
        quantity: z.number().int().positive(),
        unit_price: z.number().min(0),
    })),
});

export const createSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customer_id, notes, items } = createSOSchema.parse(req.body);
        const organizationId = req.organizationId!;

        // Fetch cost prices for profit calculation
        const variants = await prisma.productVariant.findMany({
            where: { id: { in: items.map(i => i.product_variant_id) } }
        });
        const costMap = new Map(variants.map(v => [v.id, v.cost_price]));

        let totalAmount = 0;
        let totalCost = 0;

        items.forEach(item => {
            totalAmount += item.quantity * item.unit_price;
            const cost = Number(costMap.get(item.product_variant_id) || 0);
            totalCost += item.quantity * cost;
        });

        const profit = totalAmount - totalCost;

        const so = await prisma.salesOrder.create({
            data: {
                organization_id: organizationId,
                customer_id,
                notes,
                total_amount: totalAmount,
                profit,
                items: {
                    create: items.map(item => ({
                        product_variant_id: item.product_variant_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        res.status(201).json(so);
    } catch (error) {
        next(error);
    }
};

export const getSalesOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const sos = await prisma.salesOrder.findMany({
            where: { organization_id: organizationId },
            include: {
                customer: true,
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });
        res.json(sos);
    } catch (error) {
        next(error);
    }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const so = await prisma.salesOrder.update({
            where: { id },
            data: { status },
        });

        res.json(so);
    } catch (error) {
        next(error);
    }
};

export const getSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        const so = await prisma.salesOrder.findFirst({
            where: { id, organization_id: organizationId },
            include: {
                customer: true,
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
        });

        if (!so) {
            return res.status(404).json({ message: "Sales Order not found" });
        }

        res.json(so);
    } catch (error) {
        next(error);
    }
};
