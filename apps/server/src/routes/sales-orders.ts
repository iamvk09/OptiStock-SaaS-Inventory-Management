import { Router } from "express";
import { createSalesOrder, getSalesOrders, updateStatus, getSalesOrder } from "../controllers/sales-order.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.post("/", createSalesOrder);
router.get("/", getSalesOrders);
router.get("/:id", getSalesOrder);
router.patch("/:id/status", updateStatus);

export default router;
