import express from "express";
import {
  createFeeRecord,
  getFeeRecords,
  recordPayment,
  getFeeDashboard,
  generateMonthlyFees,
  getFeeReport,
  getStudentFeeHistory,
} from "../controllers/fee.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication and tutor role
router.use(authenticateUser);
router.use(authorize("tutor"));

// Fee management
router.post("/", createFeeRecord);
router.get("/", getFeeRecords);
router.post("/:feeId/payment", recordPayment);

// Bulk operations
router.post("/generate-monthly", generateMonthlyFees);

// Analytics and reporting
router.get("/dashboard", getFeeDashboard);
router.get("/report", getFeeReport);
router.get("/student/:studentId/history", getStudentFeeHistory);

export default router;
