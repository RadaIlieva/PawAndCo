import Booking from "../models/Booking.js";

// ✅ Функция за проверка на телефон (формат: само цифри, минимум 9 цифри)
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{9,15}$/;
  return phoneRegex.test(phone);
};

// 📅 Клиент: прави нова резервация
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

export const createBookingAdmin = async (req, res) => {
  try {
    let { ownerName, dogName, breed, phone, date, hour } = req.body;

    if (!date || hour === undefined) {
      return res.status(400).json({ message: "❌ Дата и час са задължителни." });
    }

    const existing = await Booking.findOne({ date, hour });
    if (existing) {
      return res.status(400).json({ message: "❌ Този час вече е зает." });
    }

    // 👉 АКО НЯМА ДАННИ – слагаме фиктивни
    const booking = new Booking({
      ownerName: ownerName || "BLOCKED",
      dogName: dogName || "-",
      breed: breed || "-",
      phone: phone || "000000000",
      date,
      hour
    });

    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "⚠️ Грешка", error: error.message });
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

// ✏️ Редактиране на резервация (ПОПРАВЕНО)
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerName, dogName, breed, phone, date, hour } = req.body;

    // Проверка дали има поне едно поле за промяна
    if (!ownerName && !dogName && !breed && !phone && !date && !hour) {
      return res.status(400).json({ message: "❌ Моля, въведете поне едно поле за промяна." });
    }

    // Ако има телефон, валидираме
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ message: "❌ Невалиден телефонен номер. Използвайте само цифри." });
    }

    // 🔥 КРИТИЧНА ПРОВЕРКА: Ако се променя дата/час, проверяваме конфликт
    if (date || hour) {
      const currentBooking = await Booking.findById(id);
      if (!currentBooking) {
        return res.status(404).json({ message: "❌ Резервацията не е намерена." });
      }

      const newDate = date || currentBooking.date;
      const newHour = hour !== undefined ? hour : currentBooking.hour;

      // Проверяваме дали новата дата/час е заета от ДРУГА резервация
      const conflict = await Booking.findOne({ 
        date: newDate, 
        hour: newHour,
        _id: { $ne: id } // изключваме текущата резервация
      });

      if (conflict) {
        return res.status(400).json({ 
          message: `❌ Часът ${newHour}:00 на ${newDate} вече е зает от друга резервация.` 
        });
      }
    }

    // Обновяваме резервацията
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
