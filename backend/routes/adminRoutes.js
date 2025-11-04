import express from "express";
import { loginAdmin, createAdmin, verifyAdminToken } from "../controllers/AdminController.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/create", createAdmin);
router.get("/verify", verifyAdmin, verifyAdminToken);

export default router;
