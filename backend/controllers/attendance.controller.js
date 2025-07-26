import Attendance from "../models/attendance.model.js";
import Batch from "../models/batch.model.js";
import Student from "../models/student.model.js";

// Mark attendance for a batch
export const markAttendance = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { batchId, date, records } = req.body;

    // Validation
    if (!batchId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: "Please provide batchId, date, and attendance records",
      });
    }

    // Verify batch belongs to tutor
    const batch = await Batch.findOne({ _id: batchId, tutorId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Validate that all students in records belong to the batch
    const batchStudentIds = batch.students.map((id) => id.toString());
    const recordStudentIds = records.map((record) => record.studentId);

    const invalidStudents = recordStudentIds.filter(
      (id) => !batchStudentIds.includes(id)
    );
    if (invalidStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some students are not enrolled in this batch",
        invalidStudents,
      });
    }

    // Check if attendance already exists for this date and batch
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0); // Set to start of day

    let existingAttendance = await Attendance.findOne({
      tutorId,
      batchId,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.records = records;
      await existingAttendance.save();

      await existingAttendance.populate([
        { path: "batchId", select: "name subject" },
        {
          path: "records.studentId",
          select: "studentId personalInfo.parentName userId",
          populate: { path: "userId", select: "name" },
        },
      ]);

      return res.status(200).json({
        success: true,
        message: "Attendance updated successfully",
        attendance: existingAttendance,
      });
    } else {
      // Create new attendance record
      const newAttendance = await Attendance.create({
        tutorId,
        batchId,
        date: attendanceDate,
        records,
      });

      await newAttendance.populate([
        { path: "batchId", select: "name subject" },
        {
          path: "records.studentId",
          select: "studentId personalInfo.parentName userId",
          populate: { path: "userId", select: "name" },
        },
      ]);

      return res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
        attendance: newAttendance,
      });
    }
  } catch (error) {
    console.error("Mark attendance error:", error);

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
      message: "Server error marking attendance",
    });
  }
};

// Get attendance records with filtering
export const getAttendanceRecords = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const {
      page = 1,
      limit = 10,
      batchId = "all",
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = { tutorId };

    if (batchId !== "all") {
      filter.batchId = batchId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateTime;
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [attendanceRecords, totalCount] = await Promise.all([
      Attendance.find(filter)
        .populate("batchId", "name subject")
        .populate({
          path: "records.studentId",
          select: "studentId personalInfo.parentName userId",
          populate: {
            path: "userId",
            select: "name",
          },
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      attendanceRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get attendance records error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching attendance records",
    });
  }
};

// Get attendance for a specific date and batch
export const getAttendanceByDate = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { batchId, date } = req.query;

    if (!batchId || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide batchId and date",
      });
    }

    // Verify batch belongs to tutor
    const batch = await Batch.findOne({ _id: batchId, tutorId })
      .populate("students", "studentId personalInfo.parentName userId")
      .populate({
        path: "students",
        populate: {
          path: "userId",
          select: "name",
        },
      });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Find attendance for the specific date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      tutorId,
      batchId,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate({
      path: "records.studentId",
      select: "studentId personalInfo.parentName userId",
      populate: {
        path: "userId",
        select: "name",
      },
    });

    // If no attendance record exists, create a template with all students
    if (!attendance) {
      const attendanceTemplate = {
        batchId: batch._id,
        batchName: batch.name,
        date: attendanceDate,
        students: batch.students.map((student) => ({
          studentId: student._id,
          studentCode: student.studentId,
          studentName: student.userId.name,
          parentName: student.personalInfo.parentName,
          status: null, // Not marked yet
          remarks: "",
        })),
        isMarked: false,
      };

      return res.status(200).json({
        success: true,
        attendance: attendanceTemplate,
      });
    }

    // Format existing attendance
    const formattedAttendance = {
      _id: attendance._id,
      batchId: batch._id,
      batchName: batch.name,
      date: attendance.date,
      students: batch.students.map((student) => {
        const record = attendance.records.find(
          (r) => r.studentId._id.toString() === student._id.toString()
        );
        return {
          studentId: student._id,
          studentCode: student.studentId,
          studentName: student.userId.name,
          parentName: student.personalInfo.parentName,
          status: record ? record.status : null,
          remarks: record ? record.remarks : "",
        };
      }),
      isMarked: true,
    };

    res.status(200).json({
      success: true,
      attendance: formattedAttendance,
    });
  } catch (error) {
    console.error("Get attendance by date error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching attendance",
    });
  }
};

// Get attendance statistics for a batch
export const getBatchAttendanceStats = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { batchId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify batch belongs to tutor
    const batch = await Batch.findOne({ _id: batchId, tutorId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get attendance statistics
    const stats = await Attendance.getBatchStats(batchId, start, end);

    // Get overall statistics
    const overallStats = await Attendance.aggregate([
      {
        $match: {
          tutorId,
          batchId: batch._id,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: "$records",
      },
      {
        $group: {
          _id: "$records.status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate percentages
    const totalRecords = overallStats.reduce(
      (sum, stat) => sum + stat.count,
      0
    );
    const formattedStats = overallStats.map((stat) => ({
      status: stat._id,
      count: stat.count,
      percentage:
        totalRecords > 0 ? Math.round((stat.count / totalRecords) * 100) : 0,
    }));

    // Get student-wise attendance
    const studentStats = await Attendance.aggregate([
      {
        $match: {
          tutorId,
          batchId: batch._id,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: "$records",
      },
      {
        $group: {
          _id: {
            studentId: "$records.studentId",
            status: "$records.status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.studentId",
          attendance: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
          totalClasses: { $sum: "$count" },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $lookup: {
          from: "users",
          localField: "student.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          studentId: "$student.studentId",
          studentName: "$user.name",
          attendance: 1,
          totalClasses: 1,
          presentCount: {
            $reduce: {
              input: "$attendance",
              initialValue: 0,
              in: {
                $cond: [
                  { $eq: ["$$this.status", "present"] },
                  { $add: ["$$value", "$$this.count"] },
                  "$$value",
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          attendancePercentage: {
            $cond: [
              { $gt: ["$totalClasses", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$presentCount", "$totalClasses"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $sort: { attendancePercentage: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        dateRange: { start, end },
        overall: formattedStats,
        daily: stats,
        students: studentStats,
        batchInfo: {
          id: batch._id,
          name: batch.name,
          subject: batch.subject,
          totalStudents: batch.students.length,
        },
      },
    });
  } catch (error) {
    console.error("Get batch attendance stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching attendance statistics",
    });
  }
};

// Get student attendance history
export const getStudentAttendanceHistory = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { studentId } = req.params;
    const { batchId, startDate, endDate } = req.query;

    // Verify student belongs to tutor
    const student = await Student.findOne({ _id: studentId, tutorId })
      .populate("userId", "name")
      .populate("batches", "name subject");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Build filter
    const filter = {
      tutorId,
      "records.studentId": student._id,
    };

    if (batchId) {
      filter.batchId = batchId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateTime;
      }
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find(filter)
      .populate("batchId", "name subject")
      .sort({ date: -1 });

    // Format the response
    const history = attendanceRecords.map((record) => {
      const studentRecord = record.records.find(
        (r) => r.studentId.toString() === studentId
      );
      return {
        date: record.date,
        batch: record.batchId,
        status: studentRecord ? studentRecord.status : "absent",
        remarks: studentRecord ? studentRecord.remarks : "",
      };
    });

    // Calculate statistics
    const totalClasses = history.length;
    const presentCount = history.filter((h) => h.status === "present").length;
    const absentCount = history.filter((h) => h.status === "absent").length;
    const lateCount = history.filter((h) => h.status === "late").length;

    const stats = {
      totalClasses,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      attendancePercentage:
        totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0,
    };

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.userId.name,
        batches: student.batches,
      },
      stats,
      history,
    });
  } catch (error) {
    console.error("Get student attendance history error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student attendance history",
    });
  }
};

// Get attendance summary for tutor dashboard
export const getAttendanceSummary = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { days = 7 } = req.query; // Default to last 7 days

    const startDate = new Date(
      Date.now() - parseInt(days) * 24 * 60 * 60 * 1000
    );
    const endDate = new Date();

    // Get recent attendance records
    const recentAttendance = await Attendance.find({
      tutorId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("batchId", "name subject")
      .sort({ date: -1 })
      .limit(10);

    // Get overall statistics
    const overallStats = await Attendance.aggregate([
      {
        $match: {
          tutorId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $unwind: "$records",
      },
      {
        $group: {
          _id: "$records.status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get low attendance students (below 75%)
    const lowAttendanceStudents = await Attendance.aggregate([
      {
        $match: {
          tutorId,
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      },
      {
        $unwind: "$records",
      },
      {
        $group: {
          _id: "$records.studentId",
          totalClasses: { $sum: 1 },
          presentCount: {
            $sum: {
              $cond: [{ $eq: ["$records.status", "present"] }, 1, 0],
            },
          },
        },
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [{ $divide: ["$presentCount", "$totalClasses"] }, 100],
          },
        },
      },
      {
        $match: {
          attendancePercentage: { $lt: 75 },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $lookup: {
          from: "users",
          localField: "student.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          studentId: "$student.studentId",
          studentName: "$user.name",
          attendancePercentage: { $round: ["$attendancePercentage", 2] },
          totalClasses: 1,
          presentCount: 1,
        },
      },
      {
        $sort: { attendancePercentage: 1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      success: true,
      summary: {
        dateRange: { start: startDate, end: endDate },
        overallStats,
        recentAttendance,
        lowAttendanceStudents,
        totalRecords: recentAttendance.length,
      },
    });
  } catch (error) {
    console.error("Get attendance summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching attendance summary",
    });
  }
};
