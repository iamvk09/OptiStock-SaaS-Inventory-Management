import { Router } from "express";
import { createCustomer, getCustomers, updateCustomer, deleteCustomer } from "../controllers/customer.controller";
import { authenticate } from "../middleware/auth";
import { requireOrganization } from "../middleware/tenant";

const router = Router();

router.use(authenticate);
router.use(requireOrganization);

router.post("/", createCustomer);
router.get("/", getCustomers);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
