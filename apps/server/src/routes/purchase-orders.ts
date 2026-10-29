import { Router } from "express";
import { createPurchaseOrder, getPurchaseOrders, addPOComment, getPOComments, getRestockSuggestions, getPrediction, sendEmail } from "../controllers/purchase-order.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.post("/", createPurchaseOrder);
router.get("/", getPurchaseOrders);
router.get("/suggestions", getRestockSuggestions);
router.get("/prediction/:productId", getPrediction);

router.post("/:id/comments", addPOComment);
router.get("/:id/comments", getPOComments);
router.post("/:id/email", sendEmail);

export default router;
