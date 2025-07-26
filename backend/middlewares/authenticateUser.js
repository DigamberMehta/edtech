import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { isSessionValid, updateSessionActivity } from "./sessionManager.js";

const authenticateUser = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.SECERT_KEY
    );

    // Get user from database and check if still active
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found or inactive.",
      });
    }

    // Check session validity
    if (!isSessionValid(user._id)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // Update session activity
    updateSessionActivity(user._id);

    // Attach user info to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

export default authenticateUser;
