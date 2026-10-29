import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { InventoryService } from "../services/inventory.service";

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const organizationId = req.organizationId;

        if (!organizationId) {
            return res.status(400).json({ message: "Organization ID is missing" });
        }

        // 1. Counters
        const totalProducts = await prisma.product.count({ where: { organization_id: organizationId } });
        const totalWarehouses = await prisma.warehouse.count({ where: { organization_id: organizationId } });
        const totalCustomers = await prisma.customer.count({ where: { organization_id: organizationId } });
        const totalSuppliers = await prisma.supplier.count({ where: { organization_id: organizationId } });

        // 2. Stock Valuation (FIFO Default)
        const totalStockValue = await InventoryService.calculateValuation(organizationId, 'FIFO');

        // Fetch stock levels for other calculations (Aging)
        const stockLevels = await prisma.stockLevel.findMany({
            where: { warehouse: { organization_id: organizationId } },
            include: { variant: true },
        });

        // 3. Low Stock Alerts
        const lowStockItems = await prisma.productVariant.findMany({
            where: {
                product: { organization_id: organizationId },
                stock_levels: {
                    some: {
                        quantity: { lte: 10 } // Using a fixed threshold for now, ideally per variant
                    }
                }
            },
            include: { product: true, stock_levels: true },
            take: 5
        });

        // 4. Recent Activity (Sales)
        const recentSales = await prisma.salesOrder.findMany({
            where: { organization_id: organizationId },
            orderBy: { created_at: "desc" },
            take: 5,
            include: { customer: true }
        });

        // 5. Heatmap Data (Stock Value by Category)
        const products = await prisma.product.findMany({
            where: { organization_id: organizationId },
            include: { variants: true }
        });

        const categoryMap = new Map<string, number>();
        products.forEach(p => {
            const category = p.category || "Uncategorized";
            // Use product count per category for heatmap
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });

        const heatmapData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

        // 6. Sales Trends (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const sales = await prisma.salesOrder.findMany({
            where: {
                organization_id: organizationId,
                created_at: { gte: sevenDaysAgo }
            }
        });

        const trendsMap = new Map<string, number>();
        // Initialize last 7 days
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            trendsMap.set(d.toLocaleDateString(), 0);
        }

        sales.forEach(s => {
            const date = new Date(s.created_at).toLocaleDateString();
            trendsMap.set(date, (trendsMap.get(date) || 0) + Number(s.total_amount));
        });

        const salesTrends = Array.from(trendsMap.entries())
            .map(([label, value]) => ({ label, value }))
            .reverse();

        // 7. Warehouse Utilization
        const warehouses = await prisma.warehouse.findMany({
            where: { organization_id: organizationId },
            include: { stock_levels: true }
        });

        const warehouseUtilization = warehouses.map(wh => {
            const stockCount = wh.stock_levels.reduce((acc, sl) => acc + sl.quantity, 0);
            const capacity = wh.capacity || 0;
            const utilization = capacity > 0 ? Math.round((stockCount / capacity) * 100) : 0;
            return {
                id: wh.id,
                name: wh.name,
                utilization,
                capacity,
                stock_count: stockCount
            };
        });

        // 8. Expiring Batches (Next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringBatches = await prisma.stockLevel.findMany({
            where: {
                warehouse: { organization_id: organizationId },
                expiry_date: {
                    not: null,
                    lte: thirtyDaysFromNow,
                    gte: new Date() // Not already expired
                }
            },
            include: { variant: { include: { product: true } }, warehouse: true },
            orderBy: { expiry_date: 'asc' },
            take: 10
        });

        // 9. Fast Moving Items (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const soldItems = await prisma.salesItem.groupBy({
            by: ['product_variant_id'],
            where: {
                sales_order: {
                    organization_id: organizationId,
                    created_at: { gte: thirtyDaysAgo }
                }
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        // Fetch variant details for fast moving items
        const fastMovingVariantIds = soldItems.map(item => item.product_variant_id);
        const fastMovingVariants = await prisma.productVariant.findMany({
            where: { id: { in: fastMovingVariantIds } },
            include: { product: true }
        });

        const fastMovingItems = soldItems.map(item => {
            const variant = fastMovingVariants.find(v => v.id === item.product_variant_id);
            return {
                id: item.product_variant_id,
                name: variant?.product.name || 'Unknown',
                sku: variant?.sku || 'Unknown',
                quantitySold: item._sum.quantity || 0
            };
        });

        // 10. Inventory Aging
        const agingBuckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
        const now = new Date();

        stockLevels.forEach(stock => {
            const diffTime = Math.abs(now.getTime() - new Date(stock.updated_at).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const value = Number(stock.variant.cost_price) * stock.quantity;

            if (diffDays <= 30) agingBuckets['0-30'] += value;
            else if (diffDays <= 60) agingBuckets['31-60'] += value;
            else if (diffDays <= 90) agingBuckets['61-90'] += value;
            else agingBuckets['90+'] += value;
        });

        // 11. Purchase vs Sales (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlySales = await prisma.salesOrder.groupBy({
            by: ['created_at'],
            where: {
                organization_id: organizationId,
                created_at: { gte: sixMonthsAgo }
            },
            _sum: { total_amount: true }
        });

        const monthlyPurchases = await prisma.purchaseOrder.groupBy({
            by: ['order_date'],
            where: {
                organization_id: organizationId,
                order_date: { gte: sixMonthsAgo }
            },
            _sum: { total_amount: true }
        });

        // Aggregate by month (YYYY-MM)
        const purchaseSalesMap = new Map<string, { sales: number, purchases: number }>();

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            purchaseSalesMap.set(key, { sales: 0, purchases: 0 });
        }

        monthlySales.forEach(s => {
            const d = new Date(s.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (purchaseSalesMap.has(key)) {
                const curr = purchaseSalesMap.get(key)!;
                curr.sales += Number(s._sum.total_amount || 0);
            }
        });

        monthlyPurchases.forEach(p => {
            const d = new Date(p.order_date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (purchaseSalesMap.has(key)) {
                const curr = purchaseSalesMap.get(key)!;
                curr.purchases += Number(p._sum.total_amount || 0);
            }
        });

        const purchaseVsSales = Array.from(purchaseSalesMap.entries())
            .map(([month, data]) => ({ month, ...data }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // 12. Category Valuation
        const categoryValuationMap = new Map<string, number>();

        // We already have stockLevels with variants included
        // We need product category for each variant
        // Fetch products to map variant -> category
        // Actually stockLevels includes variant, but variant doesn't include product in the include above (line 27)
        // Let's fetch stockLevels with product included
        const stockLevelsWithProduct = await prisma.stockLevel.findMany({
            where: { warehouse: { organization_id: organizationId } },
            include: { variant: { include: { product: true } } },
        });

        stockLevelsWithProduct.forEach(sl => {
            const category = sl.variant.product.category || "Uncategorized";
            const val = Number(sl.variant.cost_price) * sl.quantity;
            categoryValuationMap.set(category, (categoryValuationMap.get(category) || 0) + val);
        });

        const categoryValuation = Array.from(categoryValuationMap.entries())
            .map(([category, value]) => ({ category, value }));

        res.json({
            counters: {
                products: totalProducts,
                warehouses: totalWarehouses,
                customers: totalCustomers,
                suppliers: totalSuppliers,
            },
            valuation: totalStockValue,
            lowStock: lowStockItems.map(item => ({
                id: item.id,
                name: item.product.name,
                sku: item.sku,
                quantity: item.stock_levels.reduce((acc, sl) => acc + sl.quantity, 0)
            })),
            recentSales: recentSales.map(sale => ({
                id: sale.id,
                customer: sale.customer.name,
                amount: sale.total_amount,
                status: sale.status,
                date: sale.created_at
            })),
            heatmapData,
            salesTrends,
            warehouseUtilization,
            expiringBatches: expiringBatches.map(b => ({
                id: b.id,
                productName: b.variant.product.name,
                sku: b.variant.sku,
                batchNumber: b.batch_number,
                expiryDate: b.expiry_date,
                warehouseName: b.warehouse.name,
                quantity: b.quantity
            })),
            fastMovingItems,
            inventoryAging: agingBuckets,
            purchaseVsSales,
            categoryValuation
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching dashboard stats" });
    }
};
