import { Router } from "express";
import { transferStock, reserveStock, toggleFreeze, getInventoryLedger, bulkUpdateStock } from "../controllers/inventory.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.get("/ledger", getInventoryLedger);
router.post("/transfer", transferStock);
router.post("/reserve", reserveStock);
router.post("/freeze", toggleFreeze);
router.post("/bulk-update", bulkUpdateStock);

export default router;
