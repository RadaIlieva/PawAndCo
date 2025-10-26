import express from "express";
import { 
    getOrders, 
    createOrder, 
    updateStatus, 
    deleteOrder,
    getOrderById 
} from "../controllers/OrderController.js";

const router = express.Router();

// GET /api/orders: Вземане на всички поръчки
router.get("/", getOrders); 

// POST /api/orders: Създаване на нова поръчка
router.post("/", createOrder);

// GET /api/orders/:id: Вземане на поръчка по OrderID (UUID)
router.get("/:id", getOrderById); 

// PATCH /api/orders/:id/status: Промяна на статус на поръчка по Mongo _id 
// (Тук може да продължи да се използва Mongo _id, или да се промени и този контролер да търси по orderId, ако желаете.)
router.patch("/:id/status", updateStatus); 

// DELETE /api/orders/:id: Изтриване на поръчка по OrderID (UUID)
router.delete("/:id", deleteOrder); 

export default router;