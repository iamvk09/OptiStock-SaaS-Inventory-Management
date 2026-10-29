const dotenv = require('dotenv');
const fs = require('fs');
const { execSync } = require('child_process');

try {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    console.log('Parsed DATABASE_URL length:', envConfig.DATABASE_URL ? envConfig.DATABASE_URL.length : 0);

    if (!envConfig.DATABASE_URL) {
        console.error('DATABASE_URL missing in .env');
        process.exit(1);
    }

    const env = { ...process.env, ...envConfig };

    console.log('Running prisma generate...');
    execSync('npx prisma generate --schema=apps/server/prisma/schema.prisma', { stdio: 'inherit', env: env });

    console.log('Running seed...');
    execSync('node scripts/seed-demo.js', { stdio: 'inherit', env: env });

} catch (e) {
    console.error('Operation failed:', e.message);
    process.exit(1);
}
