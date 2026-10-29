# OptiStock - SaaS Inventory Management System

![OptiStock Banner](https://via.placeholder.com/1200x400?text=OptiStock+SaaS+Inventory+System)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748)](https://www.prisma.io/)

**OptiStock** is a modern, production-ready SaaS Inventory Management System designed for multi-tenant scalability. It empowers businesses to track inventory, manage orders, and streamline operations with a beautiful, responsive user interface and a robust backend.

---

## 🚀 Comprehensive Feature List

### 📦 Inventory Control
- **Multi-Warehouse Management**: Create and manage unlimited warehouses with specific locations, zones, and bins.
- **Real-Time Stock Tracking**: Live updates of stock levels across all locations.
- **Stock Ledger**: Complete audit trail of every stock movement (In, Out, Transfer, Adjustment).
- **Batch & Expiry Tracking**: Manage perishable goods with batch numbers and expiration dates.
- **Low Stock Alerts**: Automated notifications when stock falls below defined thresholds.
- **Stock Audits**: Dedicated module for physical stock taking and reconciliation.
- **Bulk Stock Editing**: Rapidly update stock levels for multiple items via a spreadsheet-like interface.
- **Put-Away Logic**: Guided workflows for receiving stock and assigning it to specific bin locations.

### 🛍️ Product Management
- **Product Variants**: Support for complex products with multiple attributes (Size, Color, Material).
- **Product Bundles**: Create kits or bundles from existing products with automatic stock deduction.
- **Custom Fields**: Add custom data fields (Text, Number, Date, Boolean) to products to fit your specific business needs.
- **Barcode & SKU**: Support for scanning and generating barcodes/SKUs.
- **Image Management**: Upload and manage product images.
- **Categories & Tags**: Organize products with hierarchical categories and flexible tags.

### 🛒 Order Management
- **Purchase Orders (Procurement)**:
    - Manage supplier relationships and ratings.
    - Create, email, and track purchase orders.
    - Receive partial or full shipments.
- **Sales Orders (Fulfillment)**:
    - Manage customer profiles and lifetime value (LTV).
    - Create quotes and convert them to sales orders.
    - Pick, Pack, and Ship workflows.
    - **Packing Station**: Dedicated UI for warehouse staff to verify items before shipping.

### 🔌 Integrations & Automation
- **E-commerce Sync**: Native integrations for **Shopify** and **WooCommerce** (Products, Orders, Inventory).
- **Automation Rules**: Create "If This Then That" style rules (e.g., "If stock < 10, send email to vendor").
- **Webhooks**: Real-time event notifications to external systems.
- **API Access**: Generate API keys with granular scopes for custom integrations.

### 🏢 Enterprise Features
- **Multi-Tenancy**: Secure data isolation for multiple organizations.
- **Role-Based Access Control (RBAC)**: Pre-defined roles (Owner, Admin, Staff, Read-Only) to control user permissions.
- **Google Authentication**: Secure Single Sign-On (SSO) with Google.
- **Audit Logs**: Comprehensive system logs tracking who did what and when.
- **Feature Flags**: Toggle specific system features on/off per organization.

### 📊 Analytics & Reporting
- **Interactive Dashboard**: Drag-and-drop widgets for a personalized view.
- **Sales Trends**: Visual charts analyzing revenue over time.
- **Inventory Valuation**: Real-time calculation of total stock value.
- **Heatmaps**: Visualize stock distribution by category or location.
- **Utilization Metrics**: Track warehouse capacity and efficiency.

### ⚙️ Settings & Customization
- **Organization Profile**: Manage branding, billing, and subscription tiers.
- **Billing Portal**: Integrated Stripe billing for subscription management.
- **Notification Center**: Centralized hub for system alerts and messages.

---

## 🛠️ Tech Stack

### Frontend (`apps/client`)
- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) & [React Query](https://tanstack.com/query/latest)
- **UI Library**: [ShadCN UI](https://ui.shadcn.com/) (based on Radix UI) & [TailwindCSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/) & [ApexCharts](https://apexcharts.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation

### Backend (`apps/server`)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)

### Infrastructure
- **Monorepo**: Managed structure for shared configs and ease of development.
- **Containerization**: Docker support for consistent environments.

---

## 📂 Project Structure

```bash
saas-inventory-system/
├── apps/
│   ├── client/          # React Frontend Application
│   └── server/          # Node.js Express Backend API
├── prisma/              # Database Schema and Migrations
├── scripts/             # Utility scripts (seeding, setup)
├── .env.example         # Environment variable template
├── package.json         # Root dependencies and scripts
└── README.md            # Project Documentation
```

---

## ⚡ Getting Started

For a detailed, step-by-step setup guide, please refer to the **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)**.

### Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)
- **PostgreSQL** (or Supabase account)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/optistock.git
   cd optistock
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy `.env.example` to `.env` and fill in your Supabase credentials.
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database**
   ```bash
   npx prisma migrate dev --schema=apps/server/prisma/schema.prisma
   ```

5. **Run Development Servers**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_URL` | Direct connection string for migrations | Yes |
| `SUPABASE_URL` | Supabase Project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase Anon Key | Yes |
| `JWT_SECRET` | Secret for signing tokens | Yes |
| `PORT` | Backend server port (default: 3000) | No |
| `SENTRY_DSN` | Sentry DSN for Backend | Yes (for monitoring) |
| `VITE_SENTRY_DSN` | Sentry DSN for Frontend | Yes (for monitoring) |
| `RESEND_API_KEY` | Resend API Key for Emails | Yes |
| `FROM_EMAIL` | Sender Email Address | Yes |

---

## 🧪 Running the Demo

1. **Fill Environment Variables**: Ensure all keys in `.env` are populated.
2. **Run Migration**: `npx prisma migrate dev --schema=apps/server/prisma/schema.prisma`
3. **Seed Data**:
   ```bash
   node scripts/seed-demo.js
   ```
4. **Start App**: `npm run dev`
5. **Test Workflows**:
   - Login as **alice@demo.com** (Admin) to manage everything.
   - Login as **bob@demo.com** (Staff) to process orders.
   - Login as **carol@demo.com** (Viewer) to verify read-only access.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the OptiStock Team.
