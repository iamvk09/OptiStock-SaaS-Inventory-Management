const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Database State...');

    const orgs = await prisma.organization.findMany();
    console.log(`Organizations: ${orgs.length}`);
    orgs.forEach(o => console.log(` - ${o.name} (${o.id})`));

    const users = await prisma.user.findMany();
    console.log(`Users: ${users.length}`);
    users.forEach(u => console.log(` - ${u.email} (${u.role})`));

    const warehouses = await prisma.warehouse.findMany();
    console.log(`Warehouses: ${warehouses.length}`);
    warehouses.forEach(w => console.log(` - ${w.name}`));

    const products = await prisma.product.findMany();
    console.log(`Products: ${products.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
