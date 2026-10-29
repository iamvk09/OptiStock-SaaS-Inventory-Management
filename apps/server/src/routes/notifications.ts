import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);

export default router;
