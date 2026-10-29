-- CreateTable
CREATE TABLE "UserDashboardConfig" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "widgets" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDashboardConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDashboardConfig_user_id_organization_id_key" ON "UserDashboardConfig"("user_id", "organization_id");

-- AddForeignKey
ALTER TABLE "UserDashboardConfig" ADD CONSTRAINT "UserDashboardConfig_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDashboardConfig" ADD CONSTRAINT "UserDashboardConfig_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
