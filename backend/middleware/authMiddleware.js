import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Няма токен. Достъпът е отказан." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Нямате права за достъп." });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Невалиден токен." });
  }
};
