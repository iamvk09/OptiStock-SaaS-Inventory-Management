
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const EMAIL = 'admin@optistock.com';
const PASSWORD = 'password123';

let token = '';
let organizationId = '';

async function runSimulation() {
    try {
        console.log('--- Starting Demo Simulation via API ---');

        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        token = loginRes.data.token;
        const user = loginRes.data.user;
        // Assuming user has at least one org or we need to sync
        // The login response might include organizations if updated controller, 
        // but let's check /auth/me or /auth/sync if needed.
        // Actually auth.controller.ts login includes organizations.
        if (user.organizations && user.organizations.length > 0) {
            organizationId = user.organizations[0].organization_id;
        } else {
            // Try sync
            const syncRes = await axios.post(`${API_URL}/auth/sync`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            organizationId = syncRes.data.organization.id;
        }
        console.log(`Logged in. Org ID: ${organizationId}`);

        const headers = {
            Authorization: `Bearer ${token}`,
            'x-organization-id': organizationId
        };

        // 2. Create Warehouse
        console.log('2. Creating Warehouse...');
        const warehouseRes = await axios.post(`${API_URL}/warehouses`, {
            name: 'Main Central Warehouse',
            location: 'Delhi',
            capacity: 15000,
            is_frozen: false
        }, { headers });
        const warehouseId = warehouseRes.data.id;
        console.log(`Warehouse created: ${warehouseId}`);

        // 3. Create Supplier
        console.log('3. Creating Supplier...');
        const supplierRes = await axios.post(`${API_URL}/suppliers`, {
            name: 'Metro Suppliers Pvt Ltd',
            email: 'contact@metro.com',
            phone: '9876543210',
            address: 'Mumbai Industrial Area'
        }, { headers });
        const supplierId = supplierRes.data.id;
        console.log(`Supplier created: ${supplierId}`);

        // 4. Create Product
        console.log('4. Creating Product...');
        const productRes = await axios.post(`${API_URL}/products`, {
            name: 'Premium Rice 5KG Pack',
            description: 'High quality rice',
            category: 'Food Goods',
            brand: 'OptiFoods',
            hsn_code: '10063020',
            unit: 'kg',
            tags: ['Food', 'Staples'],
            variants: [
                {
                    sku: 'PR-RICE-5KG',
                    price: 250,
                    cost_price: 200,
                    low_stock_threshold: 10
                }
            ]
        }, { headers });
        const productId = productRes.data.id;
        const variantId = productRes.data.variants[0].id;
        console.log(`Product created: ${productId}, Variant: ${variantId}`);

        // 5. Add Initial Inventory (Stock In)
        // Note: API for initial stock creation is missing/complex, using Prisma directly for simulation
        console.log('5. Adding Initial Inventory (via Prisma)...');
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        await prisma.stockLevel.create({
            data: {
                warehouse_id: warehouseId,
                product_variant_id: variantId,
                quantity: 500,
                batch_number: 'BR-2024-11',
                expiry_date: new Date('2026-05-30')
            }
        });

        await prisma.stockTransaction.create({
            data: {
                organization_id: organizationId,
                type: 'IN',
                quantity: 500,
                product_variant_id: variantId,
                to_warehouse_id: warehouseId,
                notes: 'Initial Stock from Metro Suppliers',
                created_by: user.id
            }
        });
        await prisma.$disconnect();
        console.log('Inventory added.');

        // 6. Create Purchase Order
        console.log('6. Creating Purchase Order...');
        try {
            const poRes = await axios.post(`${API_URL}/purchase-orders`, {
                supplier_id: supplierId, // Note: Schema expects snake_case
                items: [
                    {
                        product_variant_id: variantId, // snake_case
                        quantity: 300,
                        unit_cost: 250
                    }
                ],
                tax_amount: 0,
                shipping_cost: 150,
                notes: 'Restocking rice'
            }, { headers });
            console.log(`PO created: ${poRes.data.id}`);
        } catch (e: any) {
            console.error('PO API Failed, using Prisma fallback. Error:', e.response?.data || e.message);
            // Fallback
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            await prisma.purchaseOrder.create({
                data: {
                    organization_id: organizationId,
                    supplier_id: supplierId,
                    status: 'DRAFT',
                    total_amount: 300 * 250 + 150,
                    shipping_cost: 150,
                    items: {
                        create: [{
                            product_variant_id: variantId,
                            quantity: 300,
                            unit_cost: 250
                        }]
                    }
                }
            });
            await prisma.$disconnect();
            console.log('PO created via Prisma fallback.');
        }

        // 7. Create Sales Order
        console.log('7. Creating Sales Order...');
        let customerId = '';
        try {
            const customerRes = await axios.post(`${API_URL}/customers`, {
                name: 'Aashirvaad Retail Store',
                phone: '9988776655'
            }, { headers });
            customerId = customerRes.data.id;
        } catch (e: any) {
            console.error('Customer API Failed, using Prisma fallback.');
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            const c = await prisma.customer.create({
                data: {
                    organization_id: organizationId,
                    name: 'Aashirvaad Retail Store',
                    phone: '9988776655'
                }
            });
            customerId = c.id;
            await prisma.$disconnect();
        }

        try {
            const soRes = await axios.post(`${API_URL}/sales-orders`, {
                customer_id: customerId, // snake_case
                items: [
                    {
                        product_variant_id: variantId,
                        quantity: 40,
                        unit_price: 300
                    }
                ],
                status: 'CONFIRMED'
            }, { headers });
            console.log(`SO created: ${soRes.data.id}`);
        } catch (e: any) {
            console.error('SO API Failed, using Prisma fallback. Error:', e.response?.data || e.message);
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            await prisma.salesOrder.create({
                data: {
                    organization_id: organizationId,
                    customer_id: customerId,
                    status: 'CONFIRMED',
                    total_amount: 40 * 300,
                    items: {
                        create: [{
                            product_variant_id: variantId,
                            quantity: 40,
                            unit_price: 300
                        }]
                    }
                }
            });
            await prisma.$disconnect();
            console.log('SO created via Prisma fallback.');
        }

        console.log('--- Simulation Completed Successfully ---');

    } catch (error: any) {
        console.error('Simulation Failed:', error.response?.data || error.message);
        // Don't exit, let it finish logs
    }
}

runSimulation();
