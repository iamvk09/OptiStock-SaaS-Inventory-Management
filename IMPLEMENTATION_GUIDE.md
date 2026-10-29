# Implementation Guide & Deployment Manual

This guide provides step-by-step instructions for setting up, running, and deploying the SaaS Inventory Management System.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation & Local Development](#installation--local-development)
4. [Database Management](#database-management)
5. [Production Build](#production-build)
6. [Deployment](#deployment)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher (LTS recommended).
- **npm**: v9 or higher (comes with Node.js).
- **Git**: For version control.
- **Docker Desktop** (Optional): If you prefer running the database or services in containers.

You will also need accounts for:
- **Supabase**: For the PostgreSQL database.
- **Stripe**: For payment processing (optional for dev, required for billing features).
- **Vercel/Railway/Render**: For deployment.

---

## Environment Setup

The project relies on environment variables for configuration.

1. **Copy the Example File**:
   In the root directory, copy `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```

2. **Configure Variables**:
   Open `.env` and fill in the required values.

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `DATABASE_URL` | Connection string for your PostgreSQL database. | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` |
   | `JWT_SECRET` | Secret key for signing JSON Web Tokens. | `your-super-secret-key-at-least-32-chars` |
   | `JWT_EXPIRES_IN` | Token expiration time. | `7d` |
   | `STRIPE_SECRET_KEY` | Secret key from Stripe Dashboard. | `sk_test_...` |
   | `STRIPE_WEBHOOK_SECRET` | Webhook secret for Stripe events. | `whsec_...` |
   | `VITE_API_URL` | URL of the backend API (for frontend). | `http://localhost:3000/api` |
   | `SENTRY_DSN` | Sentry DSN for Backend Monitoring. | `https://...@sentry.io/...` |
   | `VITE_SENTRY_DSN` | Sentry DSN for Frontend Monitoring. | `https://...@sentry.io/...` |
   | `RESEND_API_KEY` | API Key for Resend Email Service. | `re_...` |
   | `FROM_EMAIL` | Sender email address. | `noreply@yourdomain.com` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (for Storage/Admin). | `eyJ...` |
   | `SUPABASE_STORAGE_BUCKET` | Storage bucket name for images. | `products` |

---

## Installation & Local Development

1. **Install Dependencies**:
   Run this command in the root directory to install packages for all workspaces (client and server).
   ```bash
   npm install
   ```

2. **Initialize Database**:
   Push the Prisma schema to your database.
   ```bash
   npx prisma migrate dev --schema=apps/server/prisma/schema.prisma
   ```
   *Note: If this is the first time, it will create the tables.*

3. **Seed Database** (Optional):
   Populate the database with initial data.
   ```bash
   npm run seed --workspace=apps/server
   ```

4. **Start Development Servers**:
   Run both client and server in development mode.
   ```bash
   npm run dev
   ```
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend**: [http://localhost:3000](http://localhost:3000)

5. **Run Demo Seed** (Optional):
   Populate the database with a complete demo environment (Org, Admin/Staff/Viewer users, Warehouses, Products).
   ```bash
   node scripts/seed-demo.js
   ```

---

## Feature Setup

### 🛡️ RBAC & Security (Row Level Security)
To enforce Role-Based Access Control at the database level, you must apply the RLS policies.
1. Go to your Supabase Dashboard -> SQL Editor.
2. Open `scripts/supabase_rls.sql` from this repository.
3. Copy the content and run it in the Supabase SQL Editor.

### 📧 Email Service (Resend)
1. Sign up at [Resend.com](https://resend.com).
2. Create an API Key.
3. Add it to `.env` as `RESEND_API_KEY`.
4. Verify your domain and update `FROM_EMAIL`.

### 🖼️ Image CDN (Supabase Storage)
1. Go to Supabase Dashboard -> Storage.
2. Create a new public bucket named `products`.
3. Add your `SUPABASE_SERVICE_ROLE_KEY` to `.env`.

### 🚨 Monitoring (Sentry)
1. Create a project in [Sentry.io](https://sentry.io).
2. Get the DSN for Node.js (Backend) and React (Frontend).
3. Add them to `.env` as `SENTRY_DSN` and `VITE_SENTRY_DSN`.

---

## Database Management

We use **Prisma** ORM. Common commands (run from root):

- **Update Schema**: After modifying `apps/server/prisma/schema.prisma`:
  ```bash
  npx prisma migrate dev --name <migration_name> --schema=apps/server/prisma/schema.prisma
  ```
- **View Data**: Open Prisma Studio to view/edit data in a GUI.
  ```bash
  npx prisma studio --schema=apps/server/prisma/schema.prisma
  ```

---

## Production Build

To build the application for production:

```bash
npm run build
```

This will:
1. Compile the TypeScript backend (`apps/server/dist`).
2. Build the React frontend (`apps/client/dist`).

---

## Deployment

### Frontend (Vercel)
1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Configure **Root Directory** to `apps/client`.
4. **Build Command**: `npm run build` (or let Vercel detect it).
5. **Output Directory**: `dist`.
6. Add Environment Variables (`VITE_API_URL`).

### Backend (Railway/Render)
1. Push your code to GitHub.
2. Import the repository.
3. **Root Directory**: `apps/server`.
4. **Build Command**: `npm run build`.
5. **Start Command**: `npm start`.
6. Add Environment Variables (`DATABASE_URL`, `JWT_SECRET`, etc.).

### Database (Supabase)
1. Create a new project in Supabase.
2. Get the connection string (Transaction Mode recommended for serverless envs, Session for long-running servers).
3. Use this string as `DATABASE_URL` in your backend deployment.
