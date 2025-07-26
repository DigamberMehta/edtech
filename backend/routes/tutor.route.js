import express from "express";
import {
  getTutorProfile,
  updateTutorProfile,
  updateUserInfo,
  changePassword,
  getTutorStats,
} from "../controllers/tutor.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication and tutor role
router.use(authenticateUser);
router.use(authorize("tutor"));

// Profile management routes
router.get("/profile", getTutorProfile);
router.put("/profile", updateTutorProfile);
router.put("/user-info", updateUserInfo);
router.put("/change-password", changePassword);

// Dashboard stats
router.get("/stats", getTutorStats);

export default router;
