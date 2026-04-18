import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Format: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, "SECRET_KEY");
    console.log("DECODED TOKEN:", decoded);

    // 3. Attach user to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };

    // 4. Continue
    next();

  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (String(req.user.role).toUpperCase() !== "ADMIN") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};