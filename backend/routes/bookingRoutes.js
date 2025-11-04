import express from "express";
import { 
  createBooking, 
  createBookingAdmin, 
  getBookings, 
  updateBooking, 
  deleteBooking 
} from "../controllers/BookingController.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

// 📅 Клиент
router.post("/", createBooking);

// 🧑‍💼 Администратор
router.post("/admin", verifyAdmin, createBookingAdmin);
router.get("/", verifyAdmin, getBookings);
router.patch("/:id", verifyAdmin, updateBooking);
router.delete("/:id", verifyAdmin, deleteBooking);

export default router;
