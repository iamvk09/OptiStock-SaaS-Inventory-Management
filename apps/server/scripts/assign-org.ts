
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({ where: { email: 'demo2@optistock.com' } });
    const org = await prisma.organization.findUnique({ where: { slug: 'optistock-demo' } });

    if (!user || !org) {
        console.error('User or Org not found');
        return;
    }

    await prisma.userOrganizationRole.upsert({
        where: {
            user_id_organization_id: {
                user_id: user.id,
                organization_id: org.id,
            },
        },
        update: {},
        create: {
            user_id: user.id,
            organization_id: org.id,
            role: Role.ADMIN,
        },
    });

    console.log(`Assigned ${user.email} to ${org.name} as ADMIN`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
