// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  customerAddress: String,
  note: String, 
  products: [{ name: String, priceBGN: Number, quantity: Number, image: String }],
  totalPrice: Number,
  status: { type: String, default: "изчакване" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
