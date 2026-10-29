import { Router } from "express";
import express from "express";
import { createCheckoutSession, handleWebhook } from "../controllers/billing.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

// Webhook must be raw body
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

router.post("/checkout", authenticate, requireOrganization, createCheckoutSession);

export default router;
