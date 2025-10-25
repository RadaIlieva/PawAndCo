import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  dogName: { type: String, required: true },
  breed: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  hour: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
