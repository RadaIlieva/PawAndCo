import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  ownerName: String,
  dogName: String,
  breed: String,
  phone: String,
  date: String,
  hour: Number
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
