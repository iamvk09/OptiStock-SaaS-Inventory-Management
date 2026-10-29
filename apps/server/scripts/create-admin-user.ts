
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
    const email = 'admin@optistock.com';
    const password = 'password123';
    const name = 'Admin User';

    console.log(`Creating user ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password_hash: hashedPassword,
                name,
            },
            create: {
                email,
                password_hash: hashedPassword,
                name,
            },
        });
        console.log('User created/updated successfully:', user);

        // Ensure organization exists
        const orgName = 'OptiStock HQ';
        let org = await prisma.organization.findFirst({ where: { name: orgName } });

        if (!org) {
            org = await prisma.organization.create({
                data: {
                    name: orgName,
                    slug: 'optistock-hq',
                }
            });
            console.log('Organization created:', org);
        }

        // Link user to org if not already
        const link = await prisma.userOrganizationRole.findFirst({
            where: {
                user_id: user.id,
                organization_id: org.id
            }
        });

        if (!link) {
            await prisma.userOrganizationRole.create({
                data: {
                    user_id: user.id,
                    organization_id: org.id,
                    role: 'OWNER'
                }
            });
            console.log('User linked to organization.');
        }

    } catch (e) {
        console.error('Error creating user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
