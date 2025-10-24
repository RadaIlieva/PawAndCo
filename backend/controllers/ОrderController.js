import Order from '../models/Order.js';

// Вземане на всички поръчки
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Създаване на нова поръчка
export const createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "Поръчката е записана успешно!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
