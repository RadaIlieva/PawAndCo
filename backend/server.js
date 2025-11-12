import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";

// Импортирай всички твои маршрути
import product from "./routes/products.js";
import orderRoutes from "./routes/orderRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware за парсване на JSON и form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS настройки — позволяваме всички източници (можеш да ограничиш по домейн по-късно)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Път към статичните файлове (напр. изображения, качени файлове)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Сервиране на frontend страниците от frontend/html
app.use(express.static(path.join(process.cwd(), "frontend", "html")));

// API маршрути
app.use("/api/products", product);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Главна страница (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "frontend", "html", "index.html"));
});

// 404 за невалидни страници (по желание)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next(); // оставяме API грешките да минат напред
  res.status(404).send("Page not found");
});

// Стартиране на сървъра
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
