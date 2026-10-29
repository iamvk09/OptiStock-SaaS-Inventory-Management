import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../prisma";

const createSupplierSchema = z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    average_delivery_time: z.number().optional(),
});

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, address, rating, average_delivery_time } = createSupplierSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const supplier = await prisma.supplier.create({
            data: {
                organization_id: organizationId,
                name,
                email,
                phone,
                address,
                rating,
                average_delivery_time,
            },
        });

        res.status(201).json(supplier);
    } catch (error) {
        next(error);
    }
};

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const suppliers = await prisma.supplier.findMany({
            where: { organization_id: organizationId },
        });
        res.json(suppliers);
    } catch (error) {
        next(error);
    }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, rating, average_delivery_time } = req.body;
        const organizationId = req.organizationId!;

        const supplier = await prisma.supplier.update({
            where: { id, organization_id: organizationId },
            data: { name, email, phone, address, rating, average_delivery_time },
        });
        res.json(supplier);
    } catch (error) {
        next(error);
    }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        await prisma.supplier.delete({
            where: { id, organization_id: organizationId },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
