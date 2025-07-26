import express from "express";
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentStats,
  getStudentSchedule,
} from "../controllers/student.controller.js";
import {
  updateUserInfo,
  changePassword,
} from "../controllers/tutor.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication and student role
router.use(authenticateUser);
router.use(authorize("student"));

// Profile management routes
router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.put("/user-info", updateUserInfo); // Reuse from tutor controller
router.put("/change-password", changePassword); // Reuse from tutor controller

// Dashboard and academic info
router.get("/stats", getStudentStats);
router.get("/schedule", getStudentSchedule);

export default router;
