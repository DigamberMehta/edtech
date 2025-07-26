import express from "express";
import {
  createTest,
  getTests,
  getTestById,
  uploadMarks,
  publishResults,
  getBatchTestAnalytics,
  getStudentTestPerformance,
  updateTest,
  deleteTest,
} from "../controllers/test.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication and tutor role
router.use(authenticateUser);
router.use(authorize("tutor"));

// Test CRUD operations
router.post("/", createTest);
router.get("/", getTests);
router.get("/:testId", getTestById);
router.put("/:testId", updateTest);
router.delete("/:testId", deleteTest);

// Marks and results management
router.post("/:testId/marks", uploadMarks);
router.post("/:testId/publish", publishResults);

// Analytics and performance
router.get("/batch/:batchId/analytics", getBatchTestAnalytics);
router.get("/student/:studentId/performance", getStudentTestPerformance);

export default router;
