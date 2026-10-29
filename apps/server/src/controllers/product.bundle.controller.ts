import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { z } from "zod";

const createBundleSchema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    items: z.array(z.object({
        product_variant_id: z.string().uuid(),
        quantity: z.number().int().positive(),
    })).min(1),
});

export const createBundle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, sku, description, price, items } = createBundleSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const bundle = await prisma.productBundle.create({
            data: {
                organization_id: organizationId,
                name,
                sku,
                description,
                price,
                items: {
                    create: items.map(item => ({
                        product_variant_id: item.product_variant_id,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json(bundle);
    } catch (error) {
        next(error);
    }
};

export const getBundles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const bundles = await prisma.productBundle.findMany({
            where: { organization_id: organizationId },
            include: {
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
            orderBy: { created_at: 'desc' },
        });
        res.json(bundles);
    } catch (error) {
        next(error);
    }
};
