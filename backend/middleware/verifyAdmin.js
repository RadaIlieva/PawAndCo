import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "❌ Няма токен. Достъпът е отказан." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "❌ Невалиден формат на токена." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || decoded.role?.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "❌ Нямате администраторски права." });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "❌ Невалиден токен." });
  }
};
