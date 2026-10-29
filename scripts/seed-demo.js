require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding demo data...');

    // 1. Create Organization
    const org = await prisma.organization.create({
        data: {
            name: 'Demo Corp',
            slug: 'demo-corp',
            plan_tier: 'PRO',
        },
    });
    console.log('Created Organization:', org.name);

    // 2. Create Users (Admin, Staff, Viewer)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Cannot create Auth users.');
        process.exit(1);
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const users = [
        { name: 'Alice Admin', email: 'alice@demo.com', role: 'admin', password: 'password123' },
        { name: 'Bob Staff', email: 'bob@demo.com', role: 'staff', password: 'password123' },
        { name: 'Carol Viewer', email: 'carol@demo.com', role: 'viewer', password: 'password123' },
    ];

    for (const u of users) {
        // 1. Create in Supabase Auth
        let authUserId;
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { name: u.name },
        });

        if (authError) {
            if (authError.message.includes('already been registered')) {
                console.log(`User ${u.email} already exists in Auth.`);
                // Fetch existing user ID if possible, or skip
                const { data: existingUser } = await supabase.auth.admin.listUsers();
                authUserId = existingUser.users.find(user => user.email === u.email)?.id;
            } else {
                console.error(`Failed to create auth user ${u.email}:`, authError.message);
                continue;
            }
        } else {
            authUserId = authUser.user.id;
            console.log(`Created Auth User: ${u.email}`);
        }

        if (!authUserId) {
            console.error(`Could not determine Auth ID for ${u.email}`);
            continue;
        }

        // 2. Create/Update in Public Database
        // 2. Create/Update in Public Database
        // First upsert the User without role/org_id
        await prisma.user.upsert({
            where: { email: u.email },
            update: {
                id: authUserId // Ensure ID matches Auth ID
            },
            create: {
                id: authUserId, // Ensure ID matches Auth ID
                email: u.email,
                name: u.name,
                password_hash: 'managed_by_supabase_auth',
            },
        });

        // Then upsert the UserOrganizationRole
        const roleEnum = u.role.toUpperCase() === 'VIEWER' ? 'READ_ONLY' : u.role.toUpperCase();

        // Check if role exists
        const existingRole = await prisma.userOrganizationRole.findFirst({
            where: {
                user_id: authUserId,
                organization_id: org.id
            }
        });

        if (existingRole) {
            await prisma.userOrganizationRole.update({
                where: { id: existingRole.id },
                data: { role: roleEnum }
            });
        } else {
            await prisma.userOrganizationRole.create({
                data: {
                    user_id: authUserId,
                    organization_id: org.id,
                    role: roleEnum
                }
            });
        }
    }
    console.log('Synced Users with Supabase Auth:', users.map(u => u.name).join(', '));

    // 3. Create Warehouses
    const warehouses = await prisma.warehouse.createMany({
        data: [
            { name: 'Main Warehouse', location: 'New York', organization_id: org.id },
            { name: 'West Coast Hub', location: 'Los Angeles', organization_id: org.id },
            { name: 'European Distribution', location: 'Berlin', organization_id: org.id },
        ],
    });
    console.log('Created 3 Warehouses');

    // 4. Create Products
    const productsData = Array.from({ length: 10 }).map((_, i) => ({
        name: `Demo Product ${i + 1}`,
        organization_id: org.id,
        category: i % 2 === 0 ? 'Electronics' : 'Apparel',
        image_url: `https://via.placeholder.com/150?text=Product+${i + 1}`,
    }));

    for (const p of productsData) {
        await prisma.product.create({
            data: {
                ...p,
                variants: {
                    create: {
                        sku: `DEMO-${Math.random().toString(36).substring(7).toUpperCase()}`,
                        price: Math.floor(Math.random() * 100) + 10,
                        stock_levels: {
                            create: {
                                warehouse_id: (await prisma.warehouse.findFirst({ where: { organization_id: org.id } })).id,
                                quantity: Math.floor(Math.random() * 500),
                            },
                        },
                    },
                },
            },
        });
    }
    console.log('Created 10 Products with Variants and Stock');

    console.log('Demo seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
