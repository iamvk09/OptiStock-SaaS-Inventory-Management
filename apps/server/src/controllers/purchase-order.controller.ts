import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { PurchaseService } from "../services/purchase.service";

const createPOSchema = z.object({
    supplier_id: z.string(),
    expected_date: z.string().optional(),
    delivery_date: z.string().optional(),
    notes: z.string().optional(),
    tax_amount: z.number().min(0).optional(),
    discount_amount: z.number().min(0).optional(),
    shipping_cost: z.number().min(0).optional(),
    pdf_url: z.string().url().optional(),
    items: z.array(z.object({
        product_variant_id: z.string(),
        quantity: z.number().int().positive(),
        unit_cost: z.number().min(0),
    })),
});

export const createPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { supplier_id, expected_date, delivery_date, notes, tax_amount, discount_amount, shipping_cost, pdf_url, items } = createPOSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
        const totalAmount = subtotal + (tax_amount || 0) + (shipping_cost || 0) - (discount_amount || 0);

        const po = await prisma.purchaseOrder.create({
            data: {
                organization_id: organizationId,
                supplier_id,
                expected_date: expected_date ? new Date(expected_date) : undefined,
                delivery_date: delivery_date ? new Date(delivery_date) : undefined,
                notes,
                tax_amount: tax_amount || 0,
                discount_amount: discount_amount || 0,
                shipping_cost: shipping_cost || 0,
                pdf_url,
                total_amount: totalAmount,
                items: {
                    create: items.map(item => ({
                        product_variant_id: item.product_variant_id,
                        quantity: item.quantity,
                        unit_cost: item.unit_cost,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        res.status(201).json(po);
    } catch (error) {
        next(error);
    }
};

export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const pos = await prisma.purchaseOrder.findMany({
            where: { organization_id: organizationId },
            include: {
                supplier: true,
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: { created_at: "desc" }
        });
        res.json(pos);
    } catch (error) {
        next(error);
    }
};

export const addPOComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user!.id;

        const comment = await prisma.pOComment.create({
            data: {
                purchase_order_id: id,
                user_id: userId,
                text,
            },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
};

export const getPOComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const comments = await prisma.pOComment.findMany({
            where: { purchase_order_id: id },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { created_at: 'asc' }
        });
        res.json(comments);
    } catch (error) {
        next(error);
    }
};

export const getRestockSuggestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;

        const variants = await prisma.productVariant.findMany({
            where: {
                product: { organization_id: organizationId },
            },
            include: {
                stock_levels: true,
                product: true
            }
        });

        const suggestions = variants
            .map(v => {
                const totalStock = v.stock_levels.reduce((sum, sl) => sum + sl.quantity, 0);
                if (totalStock <= v.low_stock_threshold) {
                    return {
                        product_variant_id: v.id,
                        sku: v.sku,
                        name: v.product.name,
                        current_stock: totalStock,
                        threshold: v.low_stock_threshold,
                        suggested_quantity: Math.max(10, v.low_stock_threshold * 3 - totalStock) // Simple heuristic
                    };
                }
                return null;
            })
            .filter(Boolean);
        res.json(suggestions);
    } catch (error) {
        next(error);
    }
};

export const getPrediction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const quantity = await PurchaseService.predictStockNeeds(productId);
        res.json({ suggested_quantity: quantity });
    } catch (error) {
        next(error);
    }
};

export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const success = await PurchaseService.sendPOEmail(id);
        if (success) {
            res.json({ message: "Email sent successfully" });
        } else {
            res.status(500).json({ message: "Failed to send email" });
        }
    } catch (error) {
        next(error);
    }
};
