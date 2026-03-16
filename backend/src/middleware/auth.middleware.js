import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check if header exists
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header provided" });
    }

    // 2️⃣ Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    // 3️⃣ Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Attach full decoded payload (safer & flexible)
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};