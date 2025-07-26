import express from "express";
import {
  getCompleteProfile,
  uploadProfileImage,
  deactivateAccount,
  getUserActivity,
} from "../controllers/profile.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Common profile routes for both tutors and students
router.get("/complete", getCompleteProfile);
router.post("/upload-image", uploadProfileImage);
router.post("/deactivate", deactivateAccount);
router.get("/activity", getUserActivity);

export default router;
