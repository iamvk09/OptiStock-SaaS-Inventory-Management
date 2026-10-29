import { Router } from "express";
import { createOrganization, getOrganizations, getOrganization } from "../controllers/organization.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", createOrganization);
router.get("/", getOrganizations);
router.get("/:id", getOrganization);

export default router;
