import { Router } from "express";
import { register, login, logout, getMe, syncUser } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/sync", authenticate, syncUser);
router.get("/me", authenticate, getMe);

export default router;
