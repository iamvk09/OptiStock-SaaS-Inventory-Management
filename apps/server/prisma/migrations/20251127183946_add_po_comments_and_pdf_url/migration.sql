-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "pdf_url" TEXT;

-- CreateTable
CREATE TABLE "POComment" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "POComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "POComment" ADD CONSTRAINT "POComment_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POComment" ADD CONSTRAINT "POComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
