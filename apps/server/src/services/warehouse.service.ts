import prisma from "../prisma";

export class WarehouseService {
    static async createLocation(data: {
        warehouse_id: string;
        name: string;
        code: string;
        type: string;
        parent_id?: string;
        capacity?: number;
    }) {
        return prisma.location.create({
            data
        });
    }

    static async getLocations(warehouseId: string) {
        // Fetch all locations for the warehouse
        const locations = await prisma.location.findMany({
            where: { warehouse_id: warehouseId },
            orderBy: { code: 'asc' }
        });

        // Build hierarchy tree
        const buildTree = (parentId: string | null = null): any[] => {
            return locations
                .filter(loc => loc.parent_id === parentId)
                .map(loc => ({
                    ...loc,
                    children: buildTree(loc.id)
                }));
        };

        return buildTree(null);
    }

    static async suggestPutAwayLocation(warehouseId: string, variantId: string): Promise<any> {
        // 1. Check if item already exists in a location (to consolidate)
        const existingStock = await prisma.stockLevel.findFirst({
            where: {
                warehouse_id: warehouseId,
                product_variant_id: variantId,
                location_code: { not: null }
            }
        });

        if (existingStock && existingStock.location_code) {
            // Find the location object by code
            const location = await prisma.location.findFirst({
                where: { warehouse_id: warehouseId, code: existingStock.location_code }
            });
            if (location) return { location, reason: "Consolidate with existing stock" };
        }

        // 2. Find first empty BIN
        // We need to find a location of type 'BIN' that is not used in StockLevel
        // This is a bit complex in Prisma without raw SQL for "NOT IN", but let's try a simpler approach.
        // Fetch all BINs
        const bins = await prisma.location.findMany({
            where: { warehouse_id: warehouseId, type: "BIN" }
        });

        for (const bin of bins) {
            const isOccupied = await prisma.stockLevel.findFirst({
                where: { warehouse_id: warehouseId, location_code: bin.code, quantity: { gt: 0 } }
            });
            if (!isOccupied) {
                return { location: bin, reason: "Empty bin available" };
            }
        }

        return null; // No suitable location found
    }
}
