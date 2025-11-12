import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import { startCleanupJob } from "./cleanupJob.js"; 
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import product from "./routes/products.js";
import orderRoutes from "./routes/orderRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

startCleanupJob();

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

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use("/api/products", product);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "..", "frontend", "html", "index.html"));
});
app.get("/booking.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend/html/booking.html"));
});

app.get("/products.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend/html/products.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend/html/admin.html"));
});




app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next(); 
  res.status(404).send("Page not found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
