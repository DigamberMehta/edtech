import express from "express";
import {
  markAttendance,
  getAttendanceRecords,
  getAttendanceByDate,
  getBatchAttendanceStats,
  getStudentAttendanceHistory,
  getAttendanceSummary,
} from "../controllers/attendance.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication and tutor role
router.use(authenticateUser);
router.use(authorize("tutor"));

// Attendance marking and retrieval
router.post("/mark", markAttendance);
router.get("/records", getAttendanceRecords);
router.get("/by-date", getAttendanceByDate);

// Statistics and analytics
router.get("/batch/:batchId/stats", getBatchAttendanceStats);
router.get("/student/:studentId/history", getStudentAttendanceHistory);
router.get("/summary", getAttendanceSummary);

export default router;
