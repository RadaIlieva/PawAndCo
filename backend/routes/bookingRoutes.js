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

router.get("/", getBookings);

router.post("/", createBooking);

router.post("/admin", verifyAdmin, createBookingAdmin);

router.get("/admin/all", verifyAdmin, getBookings);

router.patch("/:id", verifyAdmin, updateBooking);

router.delete("/:id", verifyAdmin, deleteBooking);


export default router;
