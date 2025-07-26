import Fee from "../models/fee.model.js";
import Student from "../models/student.model.js";
import Batch from "../models/batch.model.js";

// Create fee record for student
export const createFeeRecord = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const {
      studentId,
      batchId,
      amount,
      feeType = "monthly",
      month,
      dueDate,
      remarks,
    } = req.body;

    // Validation
    if (!studentId || !batchId || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide studentId, batchId, amount, and dueDate",
      });
    }

    // Verify student belongs to tutor
    const student = await Student.findOne({ _id: studentId, tutorId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Verify batch belongs to tutor and student is enrolled
    const batch = await Batch.findOne({ _id: batchId, tutorId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (!student.batches.includes(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Student is not enrolled in this batch",
      });
    }

    // Check for duplicate monthly fee
    if (feeType === "monthly" && month) {
      const existingFee = await Fee.findOne({
        studentId,
        batchId,
        feeType: "monthly",
        month,
      });

      if (existingFee) {
        return res.status(400).json({
          success: false,
          message: `Monthly fee for ${month} already exists for this student`,
        });
      }
    }

    const newFee = await Fee.create({
      tutorId,
      studentId,
      batchId,
      amount,
      feeType,
      month,
      dueDate,
      remarks,
    });

    await newFee.populate([
      {
        path: "studentId",
        select: "studentId personalInfo.parentName userId",
        populate: { path: "userId", select: "name" },
      },
      { path: "batchId", select: "name subject" },
    ]);

    res.status(201).json({
      success: true,
      message: "Fee record created successfully",
      fee: newFee,
    });
  } catch (error) {
    console.error("Create fee record error:", error);

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
      message: "Server error creating fee record",
    });
  }
};

// Get fee records with filtering and pagination
export const getFeeRecords = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const {
      page = 1,
      limit = 10,
      status = "all",
      batchId = "all",
      studentId = "all",
      feeType = "all",
      month = "all",
      startDate,
      endDate,
      sortBy = "dueDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = { tutorId };

    if (status !== "all") {
      filter.status = status;
    }

    if (batchId !== "all") {
      filter.batchId = batchId;
    }

    if (studentId !== "all") {
      filter.studentId = studentId;
    }

    if (feeType !== "all") {
      filter.feeType = feeType;
    }

    if (month !== "all") {
      filter.month = month;
    }

    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) {
        filter.dueDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.dueDate.$lte = endDateTime;
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [feeRecords, totalCount] = await Promise.all([
      Fee.find(filter)
        .populate("studentId", "studentId personalInfo.parentName userId")
        .populate({
          path: "studentId",
          populate: {
            path: "userId",
            select: "name email",
          },
        })
        .populate("batchId", "name subject")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Fee.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      feeRecords,
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
    console.error("Get fee records error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching fee records",
    });
  }
};

// Record payment for a fee
export const recordPayment = async (req, res) => {
  try {
    const { feeId } = req.params;
    const tutorId = req.user._id;
    const {
      paymentMethod,
      transactionId,
      paidDate = new Date(),
      remarks,
    } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    const fee = await Fee.findOne({ _id: feeId, tutorId });
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    if (fee.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Fee is already paid",
      });
    }

    // Update fee record
    fee.status = "paid";
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;
    fee.paidDate = new Date(paidDate);
    if (remarks) fee.remarks = remarks;

    await fee.save();

    await fee.populate([
      {
        path: "studentId",
        select: "studentId personalInfo.parentName userId",
        populate: { path: "userId", select: "name" },
      },
      { path: "batchId", select: "name subject" },
    ]);

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      fee,
    });
  } catch (error) {
    console.error("Record payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error recording payment",
    });
  }
};

// Get fee dashboard statistics
export const getFeeDashboard = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { month, year } = req.query;

    // Set default to current month/year
    const currentDate = new Date();
    const targetMonth =
      month || (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const targetYear = year || currentDate.getFullYear().toString();
    const monthKey = `${targetYear}-${targetMonth}`;

    // Get overall statistics
    const [totalStats, monthlyStats, overdueStats, recentPayments] =
      await Promise.all([
        // Total statistics
        Fee.aggregate([
          { $match: { tutorId } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
            },
          },
        ]),

        // Monthly statistics
        Fee.aggregate([
          {
            $match: {
              tutorId,
              month: monthKey,
              feeType: "monthly",
            },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
            },
          },
        ]),

        // Overdue statistics
        Fee.aggregate([
          {
            $match: {
              tutorId,
              status: { $in: ["pending", "overdue"] },
              dueDate: { $lt: new Date() },
            },
          },
          {
            $lookup: {
              from: "students",
              localField: "studentId",
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
            $lookup: {
              from: "batches",
              localField: "batchId",
              foreignField: "_id",
              as: "batch",
            },
          },
          {
            $unwind: "$batch",
          },
          {
            $project: {
              amount: 1,
              dueDate: 1,
              month: 1,
              feeType: 1,
              studentName: "$user.name",
              studentId: "$student.studentId",
              batchName: "$batch.name",
              daysOverdue: {
                $ceil: {
                  $divide: [
                    { $subtract: [new Date(), "$dueDate"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
            },
          },
          {
            $sort: { daysOverdue: -1 },
          },
          {
            $limit: 10,
          },
        ]),

        // Recent payments
        Fee.find({
          tutorId,
          status: "paid",
          paidDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        })
          .populate("studentId", "studentId personalInfo.parentName userId")
          .populate({
            path: "studentId",
            populate: {
              path: "userId",
              select: "name",
            },
          })
          .populate("batchId", "name subject")
          .sort({ paidDate: -1 })
          .limit(10),
      ]);

    // Format statistics
    const formatStats = (stats) => {
      const result = { pending: 0, paid: 0, overdue: 0, cancelled: 0 };
      const amounts = { pending: 0, paid: 0, overdue: 0, cancelled: 0 };

      stats.forEach((stat) => {
        result[stat._id] = stat.count;
        amounts[stat._id] = stat.totalAmount;
      });

      return { counts: result, amounts };
    };

    const dashboard = {
      period: { month: targetMonth, year: targetYear },
      total: formatStats(totalStats),
      monthly: formatStats(monthlyStats),
      overdue: {
        records: overdueStats,
        totalAmount: overdueStats.reduce(
          (sum, record) => sum + record.amount,
          0
        ),
        count: overdueStats.length,
      },
      recentPayments,
      summary: {
        totalCollected:
          totalStats.find((s) => s._id === "paid")?.totalAmount || 0,
        totalPending:
          totalStats.find((s) => s._id === "pending")?.totalAmount || 0,
        totalOverdue:
          totalStats.find((s) => s._id === "overdue")?.totalAmount || 0,
        monthlyCollected:
          monthlyStats.find((s) => s._id === "paid")?.totalAmount || 0,
        monthlyPending:
          monthlyStats.find((s) => s._id === "pending")?.totalAmount || 0,
      },
    };

    res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error("Get fee dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching fee dashboard",
    });
  }
};

// Generate monthly fees for all students in a batch
export const generateMonthlyFees = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { batchId, month, dueDate } = req.body;

    if (!batchId || !month || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide batchId, month, and dueDate",
      });
    }

    // Verify batch belongs to tutor
    const batch = await Batch.findOne({ _id: batchId, tutorId }).populate(
      "students",
      "studentId personalInfo.parentName"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check if fees already exist for this month
    const existingFees = await Fee.find({
      tutorId,
      batchId,
      month,
      feeType: "monthly",
    });

    if (existingFees.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Monthly fees for ${month} already exist for this batch`,
      });
    }

    // Generate fee records for all students
    const feeRecords = batch.students.map((student) => ({
      tutorId,
      studentId: student._id,
      batchId,
      amount: batch.feeStructure.monthlyFee,
      feeType: "monthly",
      month,
      dueDate: new Date(dueDate),
    }));

    const createdFees = await Fee.insertMany(feeRecords);

    // Populate the created fees
    const populatedFees = await Fee.find({
      _id: { $in: createdFees.map((f) => f._id) },
    })
      .populate("studentId", "studentId personalInfo.parentName userId")
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .populate("batchId", "name subject");

    res.status(201).json({
      success: true,
      message: `Generated ${createdFees.length} monthly fee records`,
      fees: populatedFees,
      summary: {
        batchName: batch.name,
        month,
        studentsCount: batch.students.length,
        totalAmount: batch.feeStructure.monthlyFee * batch.students.length,
      },
    });
  } catch (error) {
    console.error("Generate monthly fees error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error generating monthly fees",
    });
  }
};

// Get fee collection report
export const getFeeReport = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const {
      reportType = "monthly", // monthly, yearly, custom
      month,
      year,
      startDate,
      endDate,
      batchId = "all",
    } = req.query;

    let dateFilter = {};
    let groupBy = {};

    // Set date filter based on report type
    if (reportType === "monthly") {
      const targetMonth =
        month || (new Date().getMonth() + 1).toString().padStart(2, "0");
      const targetYear = year || new Date().getFullYear().toString();
      dateFilter.month = `${targetYear}-${targetMonth}`;
    } else if (reportType === "yearly") {
      const targetYear = year || new Date().getFullYear().toString();
      dateFilter.month = { $regex: `^${targetYear}` };
    } else if (reportType === "custom" && startDate && endDate) {
      dateFilter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Build match filter
    const matchFilter = { tutorId, ...dateFilter };
    if (batchId !== "all") {
      matchFilter.batchId = batchId;
    }

    // Set grouping based on report type
    if (reportType === "monthly") {
      groupBy = { status: "$status", batch: "$batchId" };
    } else if (reportType === "yearly") {
      groupBy = { month: "$month", status: "$status" };
    } else {
      groupBy = { status: "$status" };
    }

    const report = await Fee.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "batches",
          localField: "batchId",
          foreignField: "_id",
          as: "batch",
        },
      },
      { $unwind: "$batch" },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          batchName: { $first: "$batch.name" },
        },
      },
      { $sort: { "_id.month": 1, "_id.status": 1 } },
    ]);

    // Get summary statistics
    const summary = await Fee.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      report: {
        type: reportType,
        period: { month, year, startDate, endDate },
        data: report,
        summary: {
          total: summary.reduce((sum, item) => sum + item.totalAmount, 0),
          collected: summary.find((s) => s._id === "paid")?.totalAmount || 0,
          pending: summary.find((s) => s._id === "pending")?.totalAmount || 0,
          overdue: summary.find((s) => s._id === "overdue")?.totalAmount || 0,
          totalRecords: summary.reduce((sum, item) => sum + item.count, 0),
        },
      },
    });
  } catch (error) {
    console.error("Get fee report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error generating fee report",
    });
  }
};

// Get student fee history
export const getStudentFeeHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user._id;
    const { batchId = "all" } = req.query;

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
    const filter = { tutorId, studentId };
    if (batchId !== "all") {
      filter.batchId = batchId;
    }

    // Get fee history
    const feeHistory = await Fee.find(filter)
      .populate("batchId", "name subject")
      .sort({ dueDate: -1 });

    // Calculate statistics
    const stats = {
      totalFees: feeHistory.length,
      paid: feeHistory.filter((f) => f.status === "paid").length,
      pending: feeHistory.filter((f) => f.status === "pending").length,
      overdue: feeHistory.filter((f) => f.status === "overdue").length,
      totalAmount: feeHistory.reduce((sum, f) => sum + f.amount, 0),
      paidAmount: feeHistory
        .filter((f) => f.status === "paid")
        .reduce((sum, f) => sum + f.amount, 0),
      pendingAmount: feeHistory
        .filter((f) => f.status !== "paid")
        .reduce((sum, f) => sum + f.amount, 0),
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
      history: feeHistory,
    });
  } catch (error) {
    console.error("Get student fee history error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student fee history",
    });
  }
};
