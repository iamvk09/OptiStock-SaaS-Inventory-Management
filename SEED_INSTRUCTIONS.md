# Demo Seed Instructions

I have updated the `scripts/seed-demo.js` file to be compatible with your current database schema. However, I encountered some environment issues (likely due to locked files or path configurations) while trying to run it automatically.

## How to Run the Seed

Please follow these steps in your terminal:

1.  **Stop any running servers** (Ctrl+C in your terminal running `npm run dev`).
2.  **Reinstall dependencies** (to ensure Prisma is correctly set up):
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```
3.  **Generate Prisma Client**:
    ```bash
    npx prisma generate --schema=apps/server/prisma/schema.prisma
    ```
4.  **Run the Seed Script**:
    ```bash
    node scripts/seed-demo.js
    ```

## Demo Data Overview

Once the seed runs successfully, the following data will be available:

### 🏢 Organization
- **Name**: Demo Corp
- **Slug**: `demo-corp`
- **Plan**: PRO

### 👥 Users (Credentials)
All users have the password: **`password123`**

| Name | Email | Role |
|------|-------|------|
| **Alice Admin** | `alice@demo.com` | `ADMIN` |
| **Bob Staff** | `bob@demo.com` | `STAFF` |
| **Carol Viewer** | `carol@demo.com` | `READ_ONLY` |

### 📦 Inventory
- **Warehouses**: 3 (New York, Los Angeles, Berlin)
- **Products**: 10 Demo Products (Electronics & Apparel)
- **Stock**: Randomized stock levels across warehouses.

## Troubleshooting

If you see errors about `DATABASE_URL`, ensure your `.env` file is present in the root directory and contains the correct Supabase connection string.
