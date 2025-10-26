import Order from "../models/Order.js";

// Вземане на всички поръчки
export const getOrders = async (req, res) => {
  try {
    console.log("[GET /api/orders] Зареждане на всички поръчки.");
    // Сортираме по дата на създаване в низходящ ред (най-новите първи)
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Грешка при извличане на поръчки:", err);
    res.status(500).json({ message: "Сървърна грешка при зареждане на поръчките." });
  }
};

// Създаване на нова поръчка
export const createOrder = async (req, res) => {
  try {
    console.log("[POST /api/orders] Опит за създаване на нова поръчка.");
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    console.log(`[POST] Успешно създадена поръчка с UUID: ${savedOrder.orderId}`);
    res.status(201).json({ message: "Поръчката е записана успешно!", order: savedOrder });
  } catch (err) {
    console.error("Грешка при създаване на поръчка:", err);
    res.status(500).json({ message: "Сървърна грешка при създаване на поръчка." });
  }
};

// 🌟 НОВ МЕТОД: Вземане на поръчка по НОМЕР НА ПОРЪЧКА (orderId)
export const getOrderById = async (req, res) => {
  const { id } = req.params; // Това трябва да е UUID (orderId)
  console.log(`[GET /api/orders/:id] Опит за намиране на поръчка с OrderID: ${id}`); // ⬅️ ЛОГ 1

  try {
    // Търсим по orderId: { orderId: id }
    const order = await Order.findOne({ orderId: id });
    
    console.log(`[GET /api/orders/:id] Резултат от Mongoose: ${order ? 'Намерен' : 'Не е намерен'}`); // ⬅️ ЛОГ 2

    if (!order) {
      return res.status(404).json({ message: "Поръчката не е намерена (по номер)." });
    }

    res.json(order);
  } catch (err) {
    console.error("Грешка при извличане на поръчка по номер:", err);
    res.status(500).json({ message: "Сървърна грешка при зареждане на поръчката." });
  }
};

// Промяна на статус на поръчка (Използва findByIdAndUpdate за ефективност)
export const updateStatus = async (req, res) => {
  const { id } = req.params; // Взимаме _id от URL (тук все още използваме Mongo _id)
  const { status } = req.body; 
  console.log(`[PATCH /api/orders/:id/status] Промяна на статус за Mongo _id: ${id} на статус: ${status}`); // ⬅️ ЛОГ 3

  if (!id || !status) {
    return res.status(400).json({ message: "Невалидни данни. ID или статус липсва." });
  }

  try {
    // Намираме поръчката по Mongo _id и обновяваме полето 'status'
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      { status: status }, 
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Поръчката не е намерена." });
    }

    res.json({ message: `Статусът е променен на '${updatedOrder.status}'`, order: updatedOrder });
  } catch (err) {
    console.error("Грешка при промяна на статус:", err);
    res.status(500).json({ message: "Сървърна грешка при промяна на статус." });
  }
};

// Изтриване на поръчка по НОМЕР НА ПОРЪЧКА (orderId)
export const deleteOrder = async (req, res) => {
  const { id } = req.params; // Това трябва да е UUID (orderId)
  console.log(`[DELETE /api/orders/:id] Опит за изтриване на поръчка с OrderID: ${id}`); // ⬅️ ЛОГ 4

  try {
    // Намираме поръчката по orderId и я изтриваме
    const deletedOrder = await Order.findOneAndDelete({ orderId: id });
    
    console.log(`[DELETE /api/orders/:id] Резултат от Mongoose: ${deletedOrder ? 'Изтрит успешно' : 'Не е намерен'}`); // ⬅️ ЛОГ 5

    if (!deletedOrder) {
      return res.status(404).json({ message: "Поръчката не е намерена за изтриване (по номер)." });
    }
    
    res.json({ message: "Поръчката е изтрита успешно." });
  } catch (err) {
    console.error("Грешка при изтриване на поръчка по номер:", err);
    res.status(500).json({ message: "Сървърна грешка при изтриване на поръчка." });
  }
};