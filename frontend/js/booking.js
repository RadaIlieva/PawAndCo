import Booking from "../models/Booking.js";

// ✅ Функция за проверка на телефон (формат: само цифри, минимум 9 цифри)
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{9,15}$/;
  return phoneRegex.test(phone);
};

// 📅 Клиент: прави нова резервация (само потребителски данни)
export const createBooking = async (req, res) => {
  try {
    const { ownerName, dogName, breed, phone, date, hour } = req.body;

    if (!ownerName || !dogName || !breed || !phone || !date || !hour) {
      return res.status(400).json({ message: "❌ Моля, попълнете всички полета." });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "❌ Невалиден телефонен номер. Въведете само цифри." });
    }

    const existing = await Booking.findOne({ date, hour });
    if (existing) {
      return res.status(400).json({ message: "❌ Този час вече е зает." });
    }

    const booking = new Booking({ ownerName, dogName, breed, phone, date, hour });
    await booking.save();

    res.status(201).json({ message: "✅ Резервацията е създадена успешно!", booking });
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при създаване на резервация", error: error.message });
  }
};

// 🧑‍💼 Админ: добавя нова резервация ръчно
export const createBookingAdmin = async (req, res) => {
  try {
    const { ownerName, dogName, breed, phone, date, hour } = req.body;

    if (!ownerName || !dogName || !breed || !phone || !date || !hour) {
      return res.status(400).json({ message: "❌ Моля, попълнете всички задължителни полета." });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "❌ Невалиден телефонен номер. Използвайте само цифри." });
    }

    const existing = await Booking.findOne({ date, hour });
    if (existing) {
      return res.status(400).json({ message: "❌ Този час вече е зает." });
    }

    const booking = new Booking({ ownerName, dogName, breed, phone, date, hour });
    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при създаване на резервация от администратор", error: error.message });
  }
};

// 🧾 Връща всички резервации (админ)
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при зареждане", error: error.message });
  }
};

// 🧾 Връща резервациите само за потребителя (без лични данни на други потребители)
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}, { date: 1, hour: 1, _id: 0 }); // връща само дата и час
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при зареждане на потребителски резервации", error: error.message });
  }
};

// ✏️ Редактиране на резервация (админ)
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerName, dogName, breed, phone, date, hour } = req.body;

    if (!ownerName && !dogName && !breed && !phone && !date && !hour) {
      return res.status(400).json({ message: "❌ Моля, въведете поне едно поле за промяна." });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ message: "❌ Невалиден телефонен номер. Използвайте само цифри." });
    }

    if (date || hour) {
      const currentBooking = await Booking.findById(id);
      if (!currentBooking) return res.status(404).json({ message: "❌ Резервацията не е намерена." });

      const newDate = date || currentBooking.date;
      const newHour = hour !== undefined ? hour : currentBooking.hour;

      const conflict = await Booking.findOne({ 
        date: newDate, 
        hour: newHour,
        _id: { $ne: id } 
      });

      if (conflict) {
        return res.status(400).json({ message: `❌ Часът ${newHour}:00 на ${newDate} вече е зает.` });
      }
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { 
        ...(ownerName && { ownerName }), 
        ...(dogName && { dogName }), 
        ...(breed && { breed }),
        ...(phone && { phone }), 
        ...(date && { date }), 
        ...(hour !== undefined && { hour })
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "❌ Резервацията не е намерена." });

    res.json({ message: "✅ Резервацията е обновена успешно.", booking: updated });
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при обновяване", error: error.message });
  }
};

// ❌ Изтриване на резервация (админ)
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "❌ Резервацията не е намерена." });

    res.json({ message: "🗑️ Резервацията е изтрита успешно." });
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка при изтриване", error: error.message });
  }
};
