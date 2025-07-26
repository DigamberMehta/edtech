import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  refreshToken,
} from "../controllers/user.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// Public authentication routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", authenticateUser, logout);
router.get("/me", authenticateUser, getProfile);
router.post("/refresh", authenticateUser, refreshToken);

// Role-specific routes for testing authorization
router.get("/tutor-only", authenticateUser, authorize("tutor"), (req, res) => {
  res.json({
    success: true,
    message: "This is a tutor-only route",
    user: req.user,
  });
});

router.get(
  "/student-only",
  authenticateUser,
  authorize("student"),
  (req, res) => {
    res.json({
      success: true,
      message: "This is a student-only route",
      user: req.user,
    });
  }
);

export default router;
