import { Router } from "express";
import { saveConfig, getConfig, triggerSync, handleWebhook } from "../controllers/integration.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

// Webhooks don't use auth middleware usually, they verify signature
router.post("/webhooks/:platform", handleWebhook);

// Protected routes
router.use(authenticate);
router.use(requireOrganization);

router.post("/config", saveConfig);
router.get("/config", getConfig);
router.post("/sync", triggerSync);

export default router;
