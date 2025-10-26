// models/Order.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    default: uuidv4, // Генерира уникален UUID за всяка поръчка
    unique: true 
  },
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  customerAddress: String,
  products: [{ 
    name: String, 
    priceBGN: Number, 
    quantity: Number, 
    image: String 
  }],
  totalPrice: Number,
  status: { 
    type: String, 
    default: "изчакване" // ⬅️ Променено: Нов статус по подразбиране
  } 
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);