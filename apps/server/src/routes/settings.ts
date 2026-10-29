import { Router } from "express";
import {
    createFeatureFlag,
    getFeatureFlags,
    updateFeatureFlag,
    createCustomField,
    getCustomFields,
    createAutomationRule,
    getAutomationRules
} from "../controllers/settings.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

// Feature Flags
router.post("/feature-flags", createFeatureFlag);
router.get("/feature-flags", getFeatureFlags);
router.patch("/feature-flags/:id", updateFeatureFlag);

// Custom Fields
router.post("/custom-fields", createCustomField);
router.get("/custom-fields", getCustomFields);

// Automation Rules
router.post("/automation-rules", createAutomationRule);
router.get("/automation-rules", getAutomationRules);

export default router;
