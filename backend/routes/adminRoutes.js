import express from "express";
import { createAdmin, loginAdmin } from "../controllers/AdminController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", createAdmin); // създава се само веднъж
router.post("/login", loginAdmin);

// пример за защитен маршрут
router.get("/dashboard", verifyAdmin, (req, res) => {
  res.json({ message: "Добре дошъл, администратор!" });
});

export default router;
