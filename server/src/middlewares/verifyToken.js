import jwt from "jsonwebtoken";
import User from "../models/user.js";

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found. Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "_id email role status isAccountVerified"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          user.status === "suspended"
            ? "Your account is suspended. Please contact an administrator."
            : "Your account is inactive. Please contact an administrator.",
      });
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      role: user.role,
      status: user.status,
      isAccountVerified: Boolean(user.isAccountVerified),
    };
    req.userId = String(user._id);
    req.body = { ...(req.body || {}), userId: String(user._id) };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default verifyToken;
