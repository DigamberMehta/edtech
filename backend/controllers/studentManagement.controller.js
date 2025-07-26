import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import Batch from "../models/batch.model.js";

// Get all students for a tutor with filtering and pagination
export const getStudents = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      batch = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter query
    const filter = { tutorId };

    if (status !== "all") {
      filter.status = status;
    }

    if (batch !== "all") {
      filter.batches = batch;
    }

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { "personalInfo.parentName": { $regex: search, $options: "i" } },
          { "personalInfo.school": { $regex: search, $options: "i" } },
          { studentId: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Combine filters
    const finalQuery = { ...filter, ...searchQuery };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const [students, totalCount] = await Promise.all([
      Student.find(finalQuery)
        .populate("userId", "name email profile")
        .populate("batches", "name subject")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Student.countDocuments(finalQuery),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      students,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching students",
    });
  }
};

// Get single student details
export const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user._id;

    const student = await Student.findOne({ _id: studentId, tutorId })
      .populate("userId", "name email profile")
      .populate("tutorId", "name email")
      .populate("batches", "name subject schedule feeStructure");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student details",
    });
  }
};

// Create new student
export const createStudent = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const {
      name,
      email,
      password = "student123", // Default password
      personalInfo,
      batches = [],
    } = req.body;

    // Validation
    if (!name || !email || !personalInfo) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and personal information",
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Validate batch IDs if provided
    if (batches.length > 0) {
      const validBatches = await Batch.find({
        _id: { $in: batches },
        tutorId,
        status: "active",
      });

      if (validBatches.length !== batches.length) {
        return res.status(400).json({
          success: false,
          message: "One or more invalid batch IDs provided",
        });
      }

      // Check batch capacity
      for (const batch of validBatches) {
        if (!batch.hasCapacity()) {
          return res.status(400).json({
            success: false,
            message: `Batch "${batch.name}" is at full capacity`,
          });
        }
      }
    }

    // Create user account for student
    const newUser = await User.create({
      name,
      email,
      password,
      role: "student",
    });

    // Create student profile
    const newStudent = await Student.create({
      userId: newUser._id,
      tutorId,
      personalInfo,
      batches,
    });

    // Update batch enrollment
    if (batches.length > 0) {
      await Batch.updateMany(
        { _id: { $in: batches } },
        { $push: { students: newStudent._id } }
      );
    }

    // Populate the response
    await newStudent.populate("userId", "name email profile");
    await newStudent.populate("batches", "name subject");

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: newStudent,
    });
  } catch (error) {
    console.error("Create student error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error creating student",
    });
  }
};

// Update student information
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user._id;
    const { personalInfo, status, batches } = req.body;

    const student = await Student.findOne({ _id: studentId, tutorId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Update personal information
    if (personalInfo) {
      student.personalInfo = { ...student.personalInfo, ...personalInfo };
    }

    // Update status
    if (status) {
      student.status = status;
    }

    // Update batch enrollment
    if (batches && Array.isArray(batches)) {
      // Validate batch IDs
      const validBatches = await Batch.find({
        _id: { $in: batches },
        tutorId,
        status: "active",
      });

      if (validBatches.length !== batches.length) {
        return res.status(400).json({
          success: false,
          message: "One or more invalid batch IDs provided",
        });
      }

      // Remove student from old batches
      await Batch.updateMany(
        { students: student._id },
        { $pull: { students: student._id } }
      );

      // Add student to new batches
      await Batch.updateMany(
        { _id: { $in: batches } },
        { $push: { students: student._id } }
      );

      student.batches = batches;
    }

    await student.save();
    await student.populate("userId", "name email profile");
    await student.populate("batches", "name subject");

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update student error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error updating student",
    });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user._id;

    const student = await Student.findOne({ _id: studentId, tutorId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Remove student from all batches
    await Batch.updateMany(
      { students: student._id },
      { $pull: { students: student._id } }
    );

    // Delete student record
    await Student.findByIdAndDelete(studentId);

    // Optionally deactivate the user account instead of deleting
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting student",
    });
  }
};

// Enroll student in batch
export const enrollStudentInBatch = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { batchId } = req.body;
    const tutorId = req.user._id;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required",
      });
    }

    // Find student
    const student = await Student.findOne({ _id: studentId, tutorId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Find batch
    const batch = await Batch.findOne({
      _id: batchId,
      tutorId,
      status: "active",
    });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check if student is already enrolled
    if (student.batches.includes(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled in this batch",
      });
    }

    // Check batch capacity
    if (!batch.hasCapacity()) {
      return res.status(400).json({
        success: false,
        message: "Batch is at full capacity",
      });
    }

    // Enroll student
    student.batches.push(batchId);
    batch.students.push(studentId);

    await Promise.all([student.save(), batch.save()]);

    res.status(200).json({
      success: true,
      message: "Student enrolled in batch successfully",
    });
  } catch (error) {
    console.error("Enroll student error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error enrolling student",
    });
  }
};

// Remove student from batch
export const removeStudentFromBatch = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { batchId } = req.body;
    const tutorId = req.user._id;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required",
      });
    }

    // Find student
    const student = await Student.findOne({ _id: studentId, tutorId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student is enrolled in the batch
    if (!student.batches.includes(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Student is not enrolled in this batch",
      });
    }

    // Remove student from batch
    student.batches = student.batches.filter((id) => id.toString() !== batchId);
    await student.save();

    // Remove student from batch's student list
    await Batch.findByIdAndUpdate(batchId, {
      $pull: { students: studentId },
    });

    res.status(200).json({
      success: true,
      message: "Student removed from batch successfully",
    });
  } catch (error) {
    console.error("Remove student from batch error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error removing student from batch",
    });
  }
};

// Get student academic history
export const getStudentAcademicHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user._id;

    const student = await Student.findOne({ _id: studentId, tutorId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Import models here to avoid circular dependency
    const Attendance = (await import("../models/attendance.model.js")).default;
    const Fee = (await import("../models/fee.model.js")).default;
    const Test = (await import("../models/test.model.js")).default;

    // Get attendance summary
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          "records.studentId": student._id,
        },
      },
      {
        $unwind: "$records",
      },
      {
        $match: {
          "records.studentId": student._id,
        },
      },
      {
        $group: {
          _id: "$records.status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get fee history
    const feeHistory = await Fee.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get test results
    const testResults = await Test.find({
      batchId: { $in: student.batches },
      "results.studentId": student._id,
      status: "completed",
    })
      .select("name subject date totalMarks results.$")
      .sort({ date: -1 })
      .limit(10);

    const academicHistory = {
      attendance: attendanceStats,
      fees: feeHistory,
      tests: testResults,
      enrollmentDate: student.enrollmentDate,
      currentStatus: student.status,
    };

    res.status(200).json({
      success: true,
      academicHistory,
    });
  } catch (error) {
    console.error("Get student academic history error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching academic history",
    });
  }
};
