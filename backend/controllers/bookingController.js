import Booking from "../models/Booking.js";

// ✅ Функция за проверка на имейл
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Функция за проверка на телефон (формат: само цифри, минимум 9 цифри)
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{9,15}$/; // може да промениш обхвата, ако искаш
  return phoneRegex.test(phone);
};

// 📅 Клиент: прави нова резервация
export const createBooking = async (req, res) => {
  try {
    const { name, email, phone, date, hour } = req.body;

    // 🔹 Проверка за празни полета
    if (!name || !email || !phone || !date || !hour) {
      return res.status(400).json({ message: "❌ Моля, попълнете всички полета." });
    }

    // 🔹 Проверка за имейл и телефон
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "❌ Невалиден имейл адрес." });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "❌ Невалиден телефонен номер. Въведете само цифри." });
    }

    // 🔹 Проверка дали часът вече е зает
    const existing = await Booking.findOne({ date, hour });
    if (existing) {
      return res.status(400).json({ message: "❌ Този час вече е зает." });
    }

    // 🔹 Създаване на резервация
    const booking = new Booking({ name, email, phone, date, hour });
    await booking.save();

    res.status(201).json({ message: "✅ Резервацията е създадена успешно!" });
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при създаване на резервация", error: error.message });
  }
};

// 🧑‍💼 Админ: добавя нова резервация ръчно
export const createBookingAdmin = async (req, res) => {
  try {
    const { name, email, phone, date, hour } = req.body;

    // 🔹 Проверки (валидност + задължителни полета)
    if (!name || !email || !phone || !date || !hour) {
      return res.status(400).json({ message: "❌ Моля, попълнете всички задължителни полета." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "❌ Невалиден имейл адрес." });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "❌ Невалиден телефонен номер. Използвайте само цифри." });
    }

    const existing = await Booking.findOne({ date, hour });
    if (existing) {
      return res.status(400).json({ message: "❌ Този час вече е зает." });
    }

    const booking = new Booking({ name, email, phone, date, hour });
    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при създаване на резервация от администратор", error: error.message });
  }
};

// 🧾 Връща всички резервации
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при зареждане", error: error.message });
  }
};

// ✏️ Обновяване на резервация (може да се променя само дата или час)
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, hour } = req.body;

    if (!date && !hour) {
      return res.status(400).json({ message: "❌ Моля, въведете нова дата или час за промяна." });
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { ...(date && { date }), ...(hour && { hour }) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "❌ Резервацията не е намерена." });
    }

    res.json({ message: "✅ Резервацията е обновена успешно.", booking: updated });
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при обновяване", error: error.message });
  }
};

// ❌ Изтриване на резервация
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "❌ Резервацията не е намерена." });
    }

    res.json({ message: "🗑️ Резервацията е изтрита успешно." });
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при изтриване", error: error.message });
  }
};
