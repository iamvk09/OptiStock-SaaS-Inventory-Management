import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { ProductHealthService } from "../services/product.health.service";

const createProductSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    hsn_code: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image_url: z.string().optional(),
    variants: z.array(z.object({
        sku: z.string().min(1),
        barcode: z.string().optional(),
        price: z.number().min(0),
        cost_price: z.number().min(0),
        attributes: z.record(z.string()).optional(),
        images: z.array(z.string()).optional(),
        low_stock_threshold: z.number().optional(),
    })).optional(),
});

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, category, brand, hsn_code, tags, image_url, variants } = createProductSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const product = await prisma.product.create({
            data: {
                organization_id: organizationId,
                name,
                description,
                category,
                brand,
                hsn_code,
                tags: tags || [],
                image_url,
                variants: variants ? {
                    create: variants.map(v => ({
                        sku: v.sku,
                        barcode: v.barcode,
                        price: v.price,
                        cost_price: v.cost_price,
                        attributes: v.attributes || {},
                        images: v.images || [],
                        low_stock_threshold: v.low_stock_threshold,
                    }))
                } : undefined,
            },
            include: {
                variants: true,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const products = await prisma.product.findMany({
            where: { organization_id: organizationId },
            include: { variants: true },
        });
        res.json(products);
    } catch (error) {
        next(error);
    }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        const product = await prisma.product.findFirst({
            where: { id, organization_id: organizationId },
            include: { variants: true },
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const calculateHealth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const score = await ProductHealthService.calculateHealthScore(id);
        res.json({ health_score: score });
    } catch (error) {
        next(error);
    }
};

// --- Bundles ---

const createBundleSchema = z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    items: z.array(z.object({
        product_variant_id: z.string(),
        quantity: z.number().min(1)
    }))
});

export const createBundle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const { name, sku, description, price, items } = createBundleSchema.parse(req.body);

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
                        quantity: item.quantity
                    }))
                }
            },
            include: { items: { include: { variant: { include: { product: true } } } } }
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
            include: { items: { include: { variant: { include: { product: true } } } } }
        });
        res.json(bundles);
    } catch (error) {
        next(error);
    }
};
