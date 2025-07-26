import Batch from "../models/batch.model.js";
import Student from "../models/student.model.js";

// Create new batch with schedule conflict detection
export const createBatch = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { name, subject, description, schedule, capacity, feeStructure } =
      req.body;

    // Validation
    if (!name || !subject || !schedule || !capacity || !feeStructure) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check for schedule conflicts
    const conflictingBatch = await checkScheduleConflict(tutorId, schedule);
    if (conflictingBatch) {
      return res.status(400).json({
        success: false,
        message: `Schedule conflict with existing batch: ${conflictingBatch.name}`,
        conflictingBatch: {
          id: conflictingBatch._id,
          name: conflictingBatch.name,
          schedule: conflictingBatch.schedule,
        },
      });
    }

    const newBatch = await Batch.create({
      tutorId,
      name,
      subject,
      description,
      schedule,
      capacity,
      feeStructure,
    });

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch: newBatch,
    });
  } catch (error) {
    console.error("Create batch error:", error);

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
      message: "Server error creating batch",
    });
  }
};

// Get all batches for tutor with filtering and pagination
export const getBatches = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const {
      page = 1,
      limit = 10,
      status = "all",
      subject = "all",
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = { tutorId };
    if (status !== "all") {
      filter.status = status;
    }
    if (subject !== "all") {
      filter.subject = { $regex: subject, $options: "i" };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [batches, totalCount] = await Promise.all([
      Batch.find(filter)
        .populate("students", "studentId personalInfo.parentName userId")
        .populate({
          path: "students",
          populate: {
            path: "userId",
            select: "name email",
          },
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Batch.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      batches,
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
    console.error("Get batches error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching batches",
    });
  }
};

// Get single batch details
export const getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;
    const tutorId = req.user._id;

    const batch = await Batch.findOne({ _id: batchId, tutorId }).populate({
      path: "students",
      populate: {
        path: "userId",
        select: "name email profile",
      },
      select: "studentId personalInfo enrollmentDate status",
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      batch,
    });
  } catch (error) {
    console.error("Get batch by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching batch details",
    });
  }
};

// Update batch
export const updateBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const tutorId = req.user._id;
    const updates = req.body;

    const batch = await Batch.findOne({ _id: batchId, tutorId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check for schedule conflicts if schedule is being updated
    if (updates.schedule) {
      const conflictingBatch = await checkScheduleConflict(
        tutorId,
        updates.schedule,
        batchId
      );
      if (conflictingBatch) {
        return res.status(400).json({
          success: false,
          message: `Schedule conflict with existing batch: ${conflictingBatch.name}`,
          conflictingBatch: {
            id: conflictingBatch._id,
            name: conflictingBatch.name,
            schedule: conflictingBatch.schedule,
          },
        });
      }
    }

    // Update batch
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        batch[key] = updates[key];
      }
    });

    await batch.save();

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      batch,
    });
  } catch (error) {
    console.error("Update batch error:", error);

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
      message: "Server error updating batch",
    });
  }
};

// Delete batch
export const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const tutorId = req.user._id;

    const batch = await Batch.findOne({ _id: batchId, tutorId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check if batch has enrolled students
    if (batch.students.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete batch with enrolled students. Please remove all students first.",
      });
    }

    await Batch.findByIdAndDelete(batchId);

    res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Delete batch error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting batch",
    });
  }
};

// Get batch analytics
export const getBatchAnalytics = async (req, res) => {
  try {
    const { batchId } = req.params;
    const tutorId = req.user._id;

    const batch = await Batch.findOne({ _id: batchId, tutorId }).populate(
      "students",
      "studentId enrollmentDate status"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Import models here to avoid circular dependency
    const Attendance = (await import("../models/attendance.model.js")).default;
    const Fee = (await import("../models/fee.model.js")).default;
    const Test = (await import("../models/test.model.js")).default;

    // Get attendance statistics
    const attendanceStats = await Attendance.getBatchStats(
      batchId,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      new Date()
    );

    // Get fee collection statistics
    const feeStats = await Fee.aggregate([
      { $match: { batchId: batch._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Get test statistics
    const testStats = await Test.getBatchTestStats(
      batchId,
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      new Date()
    );

    const analytics = {
      enrollment: {
        total: batch.students.length,
        capacity: batch.capacity,
        availableSpots: batch.capacity - batch.students.length,
        utilizationPercentage: Math.round(
          (batch.students.length / batch.capacity) * 100
        ),
      },
      attendance: attendanceStats,
      fees: feeStats,
      tests: testStats,
      schedule: batch.schedule,
      createdAt: batch.createdAt,
    };

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get batch analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching batch analytics",
    });
  }
};

// Get tutor's schedule overview
export const getScheduleOverview = async (req, res) => {
  try {
    const tutorId = req.user._id;

    const batches = await Batch.find({ tutorId, status: "active" })
      .select("name subject schedule students")
      .populate("students", "studentId");

    // Organize schedule by days
    const scheduleByDay = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    batches.forEach((batch) => {
      batch.schedule.days.forEach((day) => {
        scheduleByDay[day].push({
          batchId: batch._id,
          name: batch.name,
          subject: batch.subject,
          startTime: batch.schedule.startTime,
          endTime: batch.schedule.endTime,
          duration: batch.schedule.duration,
          studentCount: batch.students.length,
        });
      });
    });

    // Sort each day's schedule by start time
    Object.keys(scheduleByDay).forEach((day) => {
      scheduleByDay[day].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    });

    res.status(200).json({
      success: true,
      schedule: scheduleByDay,
      totalBatches: batches.length,
    });
  } catch (error) {
    console.error("Get schedule overview error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching schedule overview",
    });
  }
};

// Helper function to check schedule conflicts
const checkScheduleConflict = async (
  tutorId,
  newSchedule,
  excludeBatchId = null
) => {
  const filter = { tutorId, status: "active" };
  if (excludeBatchId) {
    filter._id = { $ne: excludeBatchId };
  }

  const existingBatches = await Batch.find(filter);

  for (const batch of existingBatches) {
    // Check if there's any day overlap
    const dayOverlap = batch.schedule.days.some((day) =>
      newSchedule.days.includes(day)
    );

    if (dayOverlap) {
      // Check time overlap
      const existingStart = timeToMinutes(batch.schedule.startTime);
      const existingEnd = timeToMinutes(batch.schedule.endTime);
      const newStart = timeToMinutes(newSchedule.startTime);
      const newEnd = timeToMinutes(newSchedule.endTime);

      // Check if times overlap
      if (!(newEnd <= existingStart || newStart >= existingEnd)) {
        return batch;
      }
    }
  }

  return null;
};

// Helper function to convert time string to minutes
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};
