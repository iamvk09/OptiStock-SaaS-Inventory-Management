import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { getDashboardConfig, updateDashboardConfig } from "../controllers/dashboard.config.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.get("/stats", getDashboardStats);
router.get("/config", getDashboardConfig);
router.post("/config", updateDashboardConfig);

export default router;
