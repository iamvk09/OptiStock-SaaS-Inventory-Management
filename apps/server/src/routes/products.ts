import { Router } from "express";
import { createProduct, getProducts, getProduct, calculateHealth, createBundle, getBundles } from "../controllers/product.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/bundles", getBundles); // Specific route before generic :id
router.post("/bundles", createBundle);
router.get("/:id", getProduct);
router.post("/:id/calculate-health", calculateHealth);

export default router;
