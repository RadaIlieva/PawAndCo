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

/* ------------------------- КЛИЕНТ ------------------------- */

// Клиент – зарежда всички резервации (за да може да оцвети календара)
router.get("/", getBookings);

// Клиент – създава резервация
router.post("/", createBooking);


/* ------------------------- АДМИН -------------------------- */

// Админ – създава резервация ръчно
router.post("/admin", verifyAdmin, createBookingAdmin);

// Админ – получава пълен списък с резервации
router.get("/admin/all", verifyAdmin, getBookings);

// Админ – редактира резервация
router.patch("/:id", verifyAdmin, updateBooking);

// Админ – изтрива резервация
router.delete("/:id", verifyAdmin, deleteBooking);


export default router;
