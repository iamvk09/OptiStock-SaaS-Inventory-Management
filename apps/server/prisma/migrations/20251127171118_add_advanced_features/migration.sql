-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIAL';

-- AlterEnum
ALTER TYPE "SalesStatus" ADD VALUE 'PACKED';

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "rate_limit" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "user_agent" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "ltv" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "ranking" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "max_users" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "max_warehouses" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "plan_tier" "PlanTier" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "hsn_code" TEXT,
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "delivery_date" TIMESTAMP(3),
ADD COLUMN     "discount_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "shipping_cost" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "tax_amount" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "profit" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "StockLevel" ADD COLUMN     "location_code" TEXT;

-- AlterTable
ALTER TABLE "StockTransaction" ADD COLUMN     "new_quantity" INTEGER,
ADD COLUMN     "previous_quantity" INTEGER;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "average_delivery_time" INTEGER,
ADD COLUMN     "rating" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Warehouse" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "utilization" DOUBLE PRECISION;
