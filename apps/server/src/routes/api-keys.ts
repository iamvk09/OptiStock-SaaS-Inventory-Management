import { Router } from "express";
import { createApiKey, getApiKeys, revokeApiKey } from "../controllers/apiKey.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.post("/", createApiKey);
router.get("/", getApiKeys);
router.delete("/:id", revokeApiKey);

export default router;
