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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use("/api/products", product);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Внимавайте: Промених app.get("/") по-долу, за да е последният Catch-All.
// Този get остава само за показване на съобщение за успешно стартиране на сървъра.
app.get("/backend-status", (req, res) => {
  res.send("🐾 Paw&Co backend is running successfully!");
});

const __dirname = path.resolve();

// Обслужване на статични файлове: Търси в public/build
app.use(express.static(path.join(__dirname, "public", "build")));

// Най-финална корекция за Render: app.get('/', ...) обикновено замества '/*'
app.get('/', (req, res) =>
  res.sendFile(path.resolve(__dirname, "public", "build", "index.html"))
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);