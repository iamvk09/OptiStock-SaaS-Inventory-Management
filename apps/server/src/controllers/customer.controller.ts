import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../prisma";

const createCustomerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    ltv: z.number().optional(),
    ranking: z.string().optional(),
});

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, address, ltv, ranking } = createCustomerSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const customer = await prisma.customer.create({
            data: {
                organization_id: organizationId,
                name,
                email,
                phone,
                address,
                ltv,
                ranking,
            },
        });

        res.status(201).json(customer);
    } catch (error) {
        next(error);
    }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const customers = await prisma.customer.findMany({
            where: { organization_id: organizationId },
        });
        res.json(customers);
    } catch (error) {
        next(error);
    }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, ltv, ranking } = req.body;
        const organizationId = req.organizationId!;

        const customer = await prisma.customer.update({
            where: { id, organization_id: organizationId },
            data: { name, email, phone, address, ltv, ranking },
        });
        res.json(customer);
    } catch (error) {
        next(error);
    }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        await prisma.customer.delete({
            where: { id, organization_id: organizationId },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
