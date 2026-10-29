import { PrismaClient, Role, PlanTier, SalesStatus, PaymentStatus, OrderStatus, TransactionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting OptiStock full demo seed...");

    // 1️⃣ Create Organization FIRST
    const org = await prisma.organization.upsert({
        where: { slug: "optistock-demo" },
        update: {},
        create: {
            id: "optistock-demo-org",
            name: "OptiStock Demo",
            slug: "optistock-demo",
            plan_tier: PlanTier.ENTERPRISE,
        },
    });

    console.log("✔ Organization created:", org.slug);

    // 2️⃣ Create Users (NO role column here)
    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = await prisma.user.upsert({
        where: { email: "demo@optistock.com" },
        update: {},
        create: {
            id: "demo-user",
            email: "demo@optistock.com",
            name: "Demo User",
            password_hash: hashedPassword,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: "demo2@optistock.com" },
        update: {},
        create: {
            id: "demo-user-2",
            email: "demo2@optistock.com",
            name: "Demo User 2",
            password_hash: hashedPassword,
        },
    });

    console.log("✔ Users created");

    // 3️⃣ Assign roles using UserOrganizationRole (correct place)
    await prisma.userOrganizationRole.upsert({
        where: { user_id_organization_id: { user_id: user.id, organization_id: org.id } },
        update: {},
        create: { user_id: user.id, organization_id: org.id, role: Role.ADMIN },
    });

    await prisma.userOrganizationRole.upsert({
        where: { user_id_organization_id: { user_id: user2.id, organization_id: org.id } },
        update: {},
        create: { user_id: user2.id, organization_id: org.id, role: Role.STAFF },
    });

    console.log("✔ Roles assigned");

    // 4️⃣ Warehouses
    const warehousesData = [
        { name: "Central Distribution", location: "New York, NY", capacity: 50000 },
        { name: "West Coast Hub", location: "Los Angeles, CA", capacity: 30000 },
        { name: "Midwest Depot", location: "Chicago, IL", capacity: 20000 },
        { name: "South Fulfillment", location: "Austin, TX", capacity: 25000 },
    ];

    const warehouses = [];
    for (const w of warehousesData) {
        warehouses.push(await prisma.warehouse.create({
            data: { ...w, organization_id: org.id, utilization: 0 },
        }));
    }

    console.log(`✔ Created ${warehouses.length} warehouses`);

    // 5️⃣ Suppliers
    const suppliers = [];
    const suppliersData = [
        { name: "Global Tech Components", email: "sales@globaltech.com" },
        { name: "Premium Furniture Co", email: "orders@premiumfurniture.com" },
        { name: "Office Supplies Direct", email: "b2b@officesupplies.com" },
        { name: "Fashion Forward Mfg", email: "wholesale@fashionforward.com" },
    ];

    for (const s of suppliersData) {
        suppliers.push(await prisma.supplier.create({
            data: { ...s, organization_id: org.id },
        }));
    }

    console.log("✔ Suppliers created");

    // 6️⃣ Customers
    const customers = [];
    const customersData = [
        { name: "TechStart Inc", email: "procurement@techstart.io", ranking: "Gold" },
        { name: "EduCorp Systems", email: "admin@educorp.edu", ranking: "Silver" },
        { name: "Retail Giants Ltd", email: "buying@retailgiants.com", ranking: "Platinum" },
        { name: "SmallBiz Solutions", email: "owner@smallbiz.net", ranking: "Bronze" },
    ];

    for (const c of customersData) {
        customers.push(await prisma.customer.create({
            data: { ...c, organization_id: org.id },
        }));
    }

    console.log("✔ Customers created");

    // 7️⃣ Products & Variants
    const variants = [];
    const productsData = [
        { name: 'Pro Laptop 15"', category: "Electronics", price: 1299, cost: 800 },
        { name: "Wireless Mouse", category: "Electronics", price: 29.99, cost: 10 },
        { name: '4K Monitor 27"', category: "Electronics", price: 399, cost: 250 },
        { name: "Mechanical Keyboard", category: "Electronics", price: 149, cost: 70 },
    ];

    for (const p of productsData) {
        const product = await prisma.product.create({
            data: {
                organization_id: org.id,
                name: p.name,
                category: p.category,
                brand: "OptiBrand",
            },
        });

        const variant = await prisma.productVariant.create({
            data: {
                product_id: product.id,
                sku: `${p.name.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
                price: p.price,
                cost_price: p.cost,
                low_stock_threshold: 15,
            },
        });

        variants.push(variant);

        // Distribute stock
        for (const w of warehouses) {
            await prisma.stockLevel.create({
                data: {
                    warehouse_id: w.id,
                    product_variant_id: variant.id,
                    quantity: Math.floor(Math.random() * 100),
                },
            });
        }
    }

    console.log("✔ Products, variants & stock created");

    // 8️⃣ Sales Orders (Historical Data)
    const today = new Date();
    for (let i = 0; i < 10; i++) { // Last 10 days
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const ordersPerDay = Math.floor(Math.random() * 3) + 3;

        for (let j = 0; j < ordersPerDay; j++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const variant = variants[Math.floor(Math.random() * variants.length)];
            const qty = Math.floor(Math.random() * 5) + 1;
            const total = Number(variant.price) * qty;

            await prisma.salesOrder.create({
                data: {
                    organization_id: org.id,
                    customer_id: customer.id,
                    status: SalesStatus.DELIVERED,
                    payment_status: PaymentStatus.PAID,
                    total_amount: total,
                    order_date: date,
                    created_at: date,
                    items: {
                        create: [{
                            product_variant_id: variant.id,
                            quantity: qty,
                            unit_price: variant.price
                        }]
                    }
                }
            });
        }
    }
    console.log("✔ Historical Sales Orders created");

    // 9️⃣ Purchase Orders
    for (let i = 0; i < 6; i++) { // Last 6 months
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);

        const poCount = Math.floor(Math.random() * 2) + 2;

        for (let j = 0; j < poCount; j++) {
            const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
            const variant = variants[Math.floor(Math.random() * variants.length)];
            const qty = Math.floor(Math.random() * 50) + 10;
            const total = Number(variant.cost_price) * qty;

            await prisma.purchaseOrder.create({
                data: {
                    organization_id: org.id,
                    supplier_id: supplier.id,
                    status: OrderStatus.RECEIVED,
                    total_amount: total,
                    order_date: date,
                    expected_date: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000),
                    items: {
                        create: [{
                            product_variant_id: variant.id,
                            quantity: qty,
                            unit_cost: variant.cost_price,
                            received_quantity: qty
                        }]
                    }
                }
            });
        }
    }
    console.log("✔ Historical Purchase Orders created");

    // 🔟 Stock Transactions
    for (let i = 0; i < 20; i++) {
        const variant = variants[Math.floor(Math.random() * variants.length)];
        const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
        const type = Math.random() > 0.5 ? TransactionType.IN : TransactionType.OUT;
        const qty = Math.floor(Math.random() * 10) + 1;

        await prisma.stockTransaction.create({
            data: {
                organization_id: org.id,
                product_variant_id: variant.id,
                type: type,
                quantity: qty,
                to_warehouse_id: type === TransactionType.IN ? warehouse.id : null,
                from_warehouse_id: type === TransactionType.OUT ? warehouse.id : null,
                reference_id: `MOV-${Date.now()}-${i}`,
                notes: type === TransactionType.IN ? 'Stock Replenishment' : 'Order Fulfillment',
            }
        });
    }
    console.log("✔ Stock Transactions created");

    console.log("🎉 SEEDING COMPLETE!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
