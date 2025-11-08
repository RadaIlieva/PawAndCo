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

app.use(express.static(path.join(process.cwd(), "frontend")));

app.use("/api/products", product);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);


app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "frontend", "html", "index.html"));
});

app.get('/:page', (req, res) => {
    const requestedPage = req.params.page;
    if (requestedPage.endsWith('.html')) {
        return res.sendFile(path.join(process.cwd(), "frontend", "html", requestedPage));
    }
    res.status(404).send('Page not found.');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);