import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// 🟢 Вземане на всички резервации
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, hour: 1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Грешка при зареждане на резервации" });
  }
});

// 🟢 Създаване на нова резервация
router.post("/", async (req, res) => {
  try {
    const { ownerName, dogName, breed, phone, date, hour } = req.body;

    // Проверка дали часът е зает
    const existing = await Booking.findOne({ date, hour });
    if (existing) {
      return res.status(400).json({ message: "❌ Този час вече е зает!" });
    }

    const newBooking = new Booking({ ownerName, dogName, breed, phone, date, hour });
    await newBooking.save();

    res.status(201).json({ message: "✅ Резервацията е успешна!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "⚠️ Грешка при запазване на резервацията" });
  }
});

export default router;
