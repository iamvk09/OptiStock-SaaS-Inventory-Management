require('dotenv').config();
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const db = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('Seeding demo data via PG...');
    await db.connect();

    try {
        // 1. Create Organization
        const orgRes = await db.query(`
            INSERT INTO "Organization" (id, name, slug, plan_tier, updated_at)
            VALUES (gen_random_uuid(), $1, $2, $3, NOW())
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `, ['Demo Corp', 'demo-corp', 'PRO']);
        const org = orgRes.rows[0];
        console.log('Organization:', org.name);

        // 2. Create Users
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase credentials');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const users = [
            { name: 'Alice Admin', email: 'alice@demo.com', role: 'admin', password: 'password123' },
            { name: 'Bob Staff', email: 'bob@demo.com', role: 'staff', password: 'password123' },
            { name: 'Carol Viewer', email: 'carol@demo.com', role: 'viewer', password: 'password123' },
        ];

        for (const u of users) {
            // Auth
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

            if (!authUserId) continue;

            // DB User
            await db.query(`
                INSERT INTO "User" (id, email, name, password_hash, updated_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id
            `, [authUserId, u.email, u.name, 'managed_by_supabase_auth']);

            // Role
            const roleEnum = u.role.toUpperCase() === 'VIEWER' ? 'READ_ONLY' : u.role.toUpperCase();
            await db.query(`
                INSERT INTO "UserOrganizationRole" (id, user_id, organization_id, role)
                VALUES (gen_random_uuid(), $1, $2, $3)
                ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role
            `, [authUserId, org.id, roleEnum]);
        }
        console.log('Users synced.');

        // 3. Warehouses
        const warehousesData = [
            { name: 'Main Warehouse', location: 'New York' },
            { name: 'West Coast Hub', location: 'Los Angeles' },
            { name: 'European Distribution', location: 'Berlin' },
        ];

        for (const w of warehousesData) {
            await db.query(`
                INSERT INTO "Warehouse" (id, organization_id, name, location, updated_at)
                VALUES (gen_random_uuid(), $1, $2, $3, NOW())
            `, [org.id, w.name, w.location]);
        }
        console.log('Warehouses created.');

        // 4. Products
        const warehouseRes = await db.query('SELECT id FROM "Warehouse" WHERE organization_id = $1 LIMIT 1', [org.id]);
        const warehouseId = warehouseRes.rows[0].id;

        for (let i = 1; i <= 10; i++) {
            const pRes = await db.query(`
                INSERT INTO "Product" (id, organization_id, name, category, image_url, updated_at)
                VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
                RETURNING id
            `, [org.id, `Demo Product ${i}`, i % 2 === 0 ? 'Electronics' : 'Apparel', `https://via.placeholder.com/150?text=Product+${i}`]);

            const pid = pRes.rows[0].id;
            const sku = `DEMO-${Math.random().toString(36).substring(7).toUpperCase()}`;
            const price = Math.floor(Math.random() * 100) + 10;

            const vRes = await db.query(`
                INSERT INTO "ProductVariant" (id, product_id, sku, price, updated_at)
                VALUES (gen_random_uuid(), $1, $2, $3, NOW())
                RETURNING id
            `, [pid, sku, price]);

            const vid = vRes.rows[0].id;
            const qty = Math.floor(Math.random() * 500);

            await db.query(`
                INSERT INTO "StockLevel" (id, warehouse_id, product_variant_id, quantity, updated_at)
                VALUES (gen_random_uuid(), $1, $2, $3, NOW())
            `, [warehouseId, vid, qty]);
        }
        console.log('Products created.');

    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        await db.end();
    }
}

main();
