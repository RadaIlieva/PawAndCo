import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Вземане на всички поръчки
router.get("/", async (req, res) => {
  const orders = await Order.find().sort({ date: -1 });
  res.json(orders);
});

// Създаване на нова поръчка
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "Поръчката е записана успешно!" });
  } catch (err) {
    res.status(500).json({ message: "Грешка при запис на поръчка", error: err });
  }
});

export default router;
