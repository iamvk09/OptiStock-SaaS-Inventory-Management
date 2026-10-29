
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDemoData() {
    console.log('Starting Database Verification...');
    const results: any = {};

    try {
        // 1. Verify Warehouse
        const warehouse = await prisma.warehouse.findFirst({
            where: { name: 'Main Central Warehouse' }
        });
        results.warehouse = !!warehouse;
        console.log(`Warehouse 'Main Central Warehouse': ${warehouse ? 'FOUND' : 'NOT FOUND'}`);

        // 2. Verify Supplier
        const supplier = await prisma.supplier.findFirst({
            where: { name: 'Metro Suppliers Pvt Ltd' }
        });
        results.supplier = !!supplier;
        console.log(`Supplier 'Metro Suppliers Pvt Ltd': ${supplier ? 'FOUND' : 'NOT FOUND'}`);

        // 3. Verify Product
        const product = await prisma.product.findFirst({
            where: { variants: { some: { sku: 'PR-RICE-5KG' } } },
            include: { variants: true }
        });
        results.product = !!product;
        console.log(`Product 'Premium Rice 5KG Pack' (SKU: PR-RICE-5KG): ${product ? 'FOUND' : 'NOT FOUND'}`);

        // 4. Verify Inventory
        if (product && warehouse) {
            const variant = product.variants.find(v => v.sku === 'PR-RICE-5KG');
            if (variant) {
                const stock = await prisma.stockLevel.findFirst({
                    where: {
                        product_variant_id: variant.id,
                        warehouse_id: warehouse.id
                    }
                });
                results.inventory = !!stock;
                console.log(`Inventory Item for Product in Warehouse: ${stock ? 'FOUND' : 'NOT FOUND'} (Qty: ${stock?.quantity})`);
            }
        }

        // 5. Verify Purchase Order
        const po = await prisma.purchaseOrder.findFirst({
            where: {
                supplier: { name: 'Metro Suppliers Pvt Ltd' },
                items: { some: { variant: { sku: 'PR-RICE-5KG' } } }
            }
        });
        results.purchaseOrder = !!po;
        console.log(`Purchase Order for Metro Suppliers: ${po ? 'FOUND' : 'NOT FOUND'}`);

        // 6. Verify Sales Order
        const so = await prisma.salesOrder.findFirst({
            where: {
                customer: { name: 'Aashirvaad Retail Store' },
                items: { some: { variant: { sku: 'PR-RICE-5KG' } } }
            }
        });
        results.salesOrder = !!so;
        console.log(`Sales Order for Aashirvaad Retail Store: ${so ? 'FOUND' : 'NOT FOUND'}`);

        console.log('Verification Complete.');
        console.log(JSON.stringify(results, null, 2));

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDemoData();
