import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./products";
import warehouseRoutes from "./warehouses";
import inventoryRoutes from "./inventory";
import supplierRoutes from "./suppliers";
import customerRoutes from "./customers";
import purchaseOrderRoutes from "./purchase-orders";
import salesOrderRoutes from "./sales-orders";
import dashboardRoutes from "./dashboard";
import billingRoutes from "./billing";
import apiKeyRoutes from "./api-keys";
import adminRoutes from "./admin";
import settingsRoutes from "./settings";
import auditRoutes from "./audit";
import shopifyRoutes from "./shopify";
import integrationRoutes from "./integrations";
import notificationRoutes from "./notifications";
import { validateConnections } from "../controllers/validation.controller";

const router = Router();

router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

router.get("/validate-connections", validateConnections);

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/customers", customerRoutes);
router.use("/purchase-orders", purchaseOrderRoutes);
router.use("/sales-orders", salesOrderRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/billing", billingRoutes);
router.use("/api-keys", apiKeyRoutes);
router.use("/admin", adminRoutes);
router.use("/settings", settingsRoutes);
router.use("/audit", auditRoutes);
router.use("/shopify", shopifyRoutes);
router.use("/integrations", integrationRoutes);
router.use("/notifications", notificationRoutes);
import uploadRoutes from "./upload";

router.use("/upload", uploadRoutes);

import emailRoutes from "./email";

router.use("/email", emailRoutes);

export default router;
