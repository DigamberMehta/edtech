import express from "express";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollStudentInBatch,
  removeStudentFromBatch,
  getStudentAcademicHistory,
} from "../controllers/studentManagement.controller.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All routes require authentication and tutor role
router.use(authenticateUser);
router.use(authorize("tutor"));

// Student CRUD operations
router.get("/", getStudents);
router.get("/:studentId", getStudentById);
router.post("/", createStudent);
router.put("/:studentId", updateStudent);
router.delete("/:studentId", deleteStudent);

// Batch enrollment management
router.post("/:studentId/enroll", enrollStudentInBatch);
router.post("/:studentId/remove-from-batch", removeStudentFromBatch);

// Academic history
router.get("/:studentId/academic-history", getStudentAcademicHistory);

export default router;
