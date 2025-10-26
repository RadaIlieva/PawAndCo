import express from "express";
import cors from "cors"; 
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import product from "./routes/products.js";
import orderRoutes from "./routes/orderRoutes.js"; // Импорт на рутовете
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();
connectDB();

const app = express();

// 🔹 Разрешаваме CORS за фронтенда
app.use(cors({
  origin: "http://127.0.0.1:5500" // адреса, от който зареждаш HTML страницата
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/products", product);
app.use("/api/orders", orderRoutes); // ✅ КОРЕКТНО РЕГИСТРИРАНЕ НА РУТА
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));