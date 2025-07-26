import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  refreshToken,
} from "../controllers/user.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (require authentication)
router.post("/logout", authenticateUser, logout);
router.get("/profile", authenticateUser, getProfile);
router.post("/refresh-token", authenticateUser, refreshToken);

export default router;
