// controllers/OrderController.js
import Order from "../models/Order.js";

// Вземане на всички поръчки
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Грешка при зареждане на поръчките." });
  }
};

// Създаване на нова поръчка
export const createOrder = async (req, res) => {
  try {
    // В req.body идват всички данни, включително note
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: "Грешка при създаване на поръчка." });
  }
};

// Изтриване на поръчка по Mongo _id
export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Поръчката не е намерена" });
    res.json({ message: "Поръчката е изтрита успешно" });
  } catch (err) {
    res.status(500).json({ message: "Грешка при изтриване на поръчка." });
  }
};

// Промяна на статус
export const updateOrderStatus = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Поръчката не е намерена" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Грешка при промяна на статус." });
  }
};
