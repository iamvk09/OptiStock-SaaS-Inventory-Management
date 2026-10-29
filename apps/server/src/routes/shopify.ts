import { Router } from "express";
import { getIntegration, saveIntegration, sync } from "../controllers/shopify.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.get("/", getIntegration);
router.post("/", saveIntegration);
router.post("/sync", sync);

export default router;
