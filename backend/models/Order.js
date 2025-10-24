import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  customerAddress: String,
  products: [
    { name: String, priceBGN: Number, quantity: Number, image: String }
  ],
  totalPrice: Number
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
