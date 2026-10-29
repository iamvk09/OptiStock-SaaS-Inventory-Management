import { Router } from "express";
import { getDashboardStats } from "../controllers/analytics.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.get("/dashboard", getDashboardStats);

export default router;
