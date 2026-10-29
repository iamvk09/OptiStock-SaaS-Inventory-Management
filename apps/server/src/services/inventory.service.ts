import prisma from "../prisma";

export class InventoryService {
    static async calculateValuation(organizationId: string, method: 'FIFO' | 'LIFO' = 'FIFO') {
        // 1. Get all stock levels with product cost
        const stockLevels = await prisma.stockLevel.findMany({
            where: { warehouse: { organization_id: organizationId } },
            include: {
                variant: true,
                warehouse: true
            }
        });

        // For a true FIFO/LIFO, we need batch history. 
        // Since we only have current stock levels and transactions, we will approximate.
        // Ideally, we would track every "IN" transaction as a batch.

        // Simplified Logic for MVP:
        // We use the current cost price from ProductVariant. 
        // In a real system, we'd look up the cost at the time of purchase (PurchaseOrder).

        // Let's try to be smarter:
        // Fetch recent Purchase Orders to get "layers" of cost.

        const purchaseOrders = await prisma.purchaseOrder.findMany({
            where: { organization_id: organizationId, status: 'RECEIVED' },
            include: { items: true },
            orderBy: { created_at: method === 'FIFO' ? 'desc' : 'asc' } // Reverse order for processing
        });

        let totalValue = 0;

        // Map stock by variant
        const stockByVariant = new Map<string, number>();
        stockLevels.forEach(sl => {
            const current = stockByVariant.get(sl.product_variant_id) || 0;
            stockByVariant.set(sl.product_variant_id, current + sl.quantity);
        });

        // Process valuation
        for (const [variantId, quantity] of stockByVariant.entries()) {
            let remainingQty = quantity;
            let variantValue = 0;

            // 1. Consume from POs (Layers)
            const variantPOs = purchaseOrders
                .flatMap(po => po.items)
                .filter(item => item.product_variant_id === variantId);

            for (const item of variantPOs) {
                if (remainingQty <= 0) break;

                const take = Math.min(remainingQty, item.quantity);
                variantValue += take * Number(item.unit_cost);
                remainingQty -= take;
            }

            // 2. If stock remains (e.g. initial stock or missing POs), use current cost price
            if (remainingQty > 0) {
                const variant = stockLevels.find(sl => sl.product_variant_id === variantId)?.variant;
                if (variant) {
                    variantValue += remainingQty * Number(variant.cost_price);
                }
            }

            totalValue += variantValue;
        }

        return totalValue;
    }
}
