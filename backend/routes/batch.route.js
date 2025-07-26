import express from "express";
import {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getBatchAnalytics,
  getScheduleOverview,
} from "../controllers/batch.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication and tutor role
router.use(authenticateUser);
router.use(authorize("tutor"));

// Batch CRUD operations
router.post("/", createBatch);
router.get("/", getBatches);
router.get("/schedule-overview", getScheduleOverview);
router.get("/:batchId", getBatchById);
router.put("/:batchId", updateBatch);
router.delete("/:batchId", deleteBatch);

// Batch analytics
router.get("/:batchId/analytics", getBatchAnalytics);

export default router;
