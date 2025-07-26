import User from "../models/user.model.js";
import Student from "../models/student.model.js";

// Get student profile with academic details
export const getStudentProfile = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ userId: req.user._id })
      .populate("userId", "-password")
      .populate("tutorId", "name email profile.phone")
      .populate("batches", "name subject schedule");

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      student: studentProfile,
    });
  } catch (error) {
    console.error("Get student profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student profile",
    });
  }
};

// Update student profile (limited fields that student can update)
export const updateStudentProfile = async (req, res) => {
  try {
    const { personalInfo } = req.body;

    const studentProfile = await Student.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Students can only update certain personal information
    if (personalInfo) {
      const allowedFields = [
        "parentName",
        "parentPhone",
        "parentEmail",
        "school",
      ];
      allowedFields.forEach((field) => {
        if (personalInfo[field] !== undefined) {
          studentProfile.personalInfo[field] = personalInfo[field];
        }
      });
    }

    await studentProfile.save();
    await studentProfile.populate("userId", "-password");

    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      student: studentProfile,
    });
  } catch (error) {
    console.error("Update student profile error:", error);

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
      message: "Server error updating student profile",
    });
  }
};

// Get student dashboard stats
export const getStudentStats = async (req, res) => {
  try {
    // Import models here to avoid circular dependency
    const Attendance = (await import("../models/attendance.model.js")).default;
    const Fee = (await import("../models/fee.model.js")).default;
    const Test = (await import("../models/test.model.js")).default;

    const studentProfile = await Student.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const studentId = studentProfile._id;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Get attendance stats for current month
    const attendanceStats = await Attendance.getStudentStats(
      studentId,
      studentProfile.batches[0], // Assuming first batch for now
      new Date(currentMonth + "-01"),
      new Date()
    );

    // Get fee status
    const feeStatus = await Fee.findOne({
      studentId,
      month: currentMonth,
      status: { $in: ["pending", "overdue"] },
    });

    // Get recent test results
    const recentTests = await Test.find({
      batchId: { $in: studentProfile.batches },
      status: "completed",
      isPublished: true,
      "results.studentId": studentId,
    })
      .sort({ date: -1 })
      .limit(5)
      .select("name subject date totalMarks results.$");

    const stats = {
      enrolledBatches: studentProfile.batches.length,
      attendancePercentage: calculateAttendancePercentage(attendanceStats),
      feeStatus: feeStatus ? feeStatus.status : "paid",
      recentTestCount: recentTests.length,
    };

    res.status(200).json({
      success: true,
      stats,
      recentTests,
    });
  } catch (error) {
    console.error("Get student stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student statistics",
    });
  }
};

// Helper function to calculate attendance percentage
const calculateAttendancePercentage = (attendanceStats) => {
  if (!attendanceStats || attendanceStats.length === 0) return 0;

  const totalClasses = attendanceStats.reduce(
    (sum, stat) => sum + stat.count,
    0
  );
  const presentClasses =
    attendanceStats.find((stat) => stat._id === "present")?.count || 0;

  return totalClasses > 0
    ? Math.round((presentClasses / totalClasses) * 100)
    : 0;
};

// Get student schedule
export const getStudentSchedule = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({
      userId: req.user._id,
    }).populate({
      path: "batches",
      select: "name subject schedule",
      match: { status: "active" },
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Format schedule data
    const schedule = studentProfile.batches.map((batch) => ({
      batchId: batch._id,
      name: batch.name,
      subject: batch.subject,
      days: batch.schedule.days,
      startTime: batch.schedule.startTime,
      endTime: batch.schedule.endTime,
      duration: batch.schedule.duration,
    }));

    res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    console.error("Get student schedule error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student schedule",
    });
  }
};
