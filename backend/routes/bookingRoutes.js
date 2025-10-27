import express from "express";
import { 
  createBooking, 
  createBookingAdmin, 
  getBookings, 
  updateBooking, 
  deleteBooking 
} from "../controllers/BookingController.js";

const router = express.Router();

// 📅 Клиент
router.post("/", createBooking);

// 🧑‍💼 Администратор
router.post("/admin", createBookingAdmin);
router.get("/", getBookings);
router.patch("/:id", updateBooking);
router.delete("/:id", deleteBooking);

export default router;
