import express from "express";
import cors from "cors"; 
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import product from "./routes/products.js";
import orderRoutes from "./routes/orderRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

// 🟢 ЗАДЪЛЖИТЕЛНО ПРЕДИ РУТОВЕТЕ
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/products", product);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
