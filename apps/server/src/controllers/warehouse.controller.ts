import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { WarehouseService } from "../services/warehouse.service";

const createWarehouseSchema = z.object({
    name: z.string().min(1),
    location: z.string().optional(),
    capacity: z.number().optional(),
});

export const createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, location, capacity } = createWarehouseSchema.parse(req.body);
        const organizationId = req.organizationId!;

        const warehouse = await prisma.warehouse.create({
            data: {
                organization_id: organizationId,
                name,
                location,
                capacity,
            },
        });

        res.status(201).json(warehouse);
    } catch (error) {
        next(error);
    }
};

export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.organizationId!;
        const warehouses = await prisma.warehouse.findMany({
            where: { organization_id: organizationId },
        });
        res.json(warehouses);
    } catch (error) {
        next(error);
    }
};

export const updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, location, capacity, is_frozen } = req.body;
        const organizationId = req.organizationId!;

        const warehouse = await prisma.warehouse.update({
            where: { id, organization_id: organizationId },
            data: { name, location, capacity, is_frozen },
        });
        res.json(warehouse);
    } catch (error) {
        next(error);
    }
};

export const deleteWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const organizationId = req.organizationId!;

        await prisma.warehouse.delete({
            where: { id, organization_id: organizationId },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { warehouseId } = req.params;
        const location = await WarehouseService.createLocation({ ...req.body, warehouse_id: warehouseId });
        res.status(201).json(location);
    } catch (error) {
        next(error);
    }
};

export const getLocations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { warehouseId } = req.params;
        const locations = await WarehouseService.getLocations(warehouseId);
        res.json(locations);
    } catch (error) {
        next(error);
    }
};

export const getPutAwaySuggestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { warehouseId } = req.params;
        const { variantId } = req.query;
        const suggestion = await WarehouseService.suggestPutAwayLocation(warehouseId, String(variantId));
        res.json(suggestion);
    } catch (error) {
        next(error);
    }
};
