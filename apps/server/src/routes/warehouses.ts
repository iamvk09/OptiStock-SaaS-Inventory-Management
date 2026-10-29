import { Router } from "express";
import { createWarehouse, getWarehouses, updateWarehouse, deleteWarehouse, createLocation, getLocations, getPutAwaySuggestion } from "../controllers/warehouse.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.post("/", createWarehouse);
router.get("/", getWarehouses);
router.put("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

router.post("/:warehouseId/locations", createLocation);
router.get("/:warehouseId/locations", getLocations);
router.get("/:warehouseId/put-away-suggestion", getPutAwaySuggestion);

export default router;
