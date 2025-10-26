// routes/orderRoutes.js
import express from "express";
import { getOrders, createOrder, deleteOrder, updateOrderStatus } from "../controllers/OrderController.js";

const router = express.Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.delete("/:id", deleteOrder);
router.patch("/:id/status", updateOrderStatus);

export default router;
