import { Router } from "express";
import { createAuditSession, getAuditSession, updateAuditItem, finalizeAudit, getAudits } from "../controllers/inventory.audit.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.post("/", createAuditSession);
router.get("/", getAudits);
router.get("/:id", getAuditSession);
router.post("/:id/item", updateAuditItem);
router.post("/:id/finalize", finalizeAudit);

export default router;
