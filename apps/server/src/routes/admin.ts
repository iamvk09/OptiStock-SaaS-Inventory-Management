import { Router } from "express";
import { getAllOrganizations, getAllUsers } from "../controllers/admin.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// TODO: Add super-admin middleware
router.use(authenticate);

router.get("/organizations", getAllOrganizations);
router.get("/users", getAllUsers);

export default router;
