import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// 🟢 Създаване на админ
export const createAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return res.status(400).json({ message: "Администраторът вече съществува!" });
    }

    const { email, password } = req.body;
    const newAdmin = new Admin({ email, password });
    await newAdmin.save();

    res.status(201).json({ message: "✅ Администраторът е създаден успешно!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Грешка при създаване на администратор." });
  }
};

// 🔑 Вход на админ
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Невалиден имейл или парола." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Невалидна парола." });
    }

    // Без време на изтичане
    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET);

    res.json({ message: "✅ Успешен вход!", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Грешка при вход." });
  }
};

// 🧾 Проверка дали токенът е валиден
export const verifyAdminToken = async (req, res) => {
  res.json({ valid: true });
};
