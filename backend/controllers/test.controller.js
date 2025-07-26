import Test from "../models/test.model.js";
import Batch from "../models/batch.model.js";
import Student from "../models/student.model.js";

// Create new test
export const createTest = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { batchId, name, subject, date, totalMarks, duration, instructions } =
      req.body;

    // Validation
    if (!batchId || !name || !subject || !date || !totalMarks || !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
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

    const newTest = await Test.create({
      tutorId,
      batchId,
      name,
      subject,
      date: new Date(date),
      totalMarks,
      duration,
      instructions,
    });

    await newTest.populate("batchId", "name subject students");

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      test: newTest,
    });
  } catch (error) {
    console.error("Create test error:", error);

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
      message: "Server error creating test",
    });
  }
};

// Get tests with filtering and pagination
export const getTests = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const {
      page = 1,
      limit = 10,
      batchId = "all",
      status = "all",
      subject = "all",
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

    if (status !== "all") {
      filter.status = status;
    }

    if (subject !== "all") {
      filter.subject = { $regex: subject, $options: "i" };
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
    const [tests, totalCount] = await Promise.all([
      Test.find(filter)
        .populate("batchId", "name subject students")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Test.countDocuments(filter),
    ]);

    // Add result statistics to each test
    const testsWithStats = tests.map((test) => {
      const testObj = test.toObject();
      testObj.resultStats = {
        totalStudents: test.batchId.students.length,
        resultsUploaded: test.results.length,
        isPublished: test.isPublished,
        averageMarks: test.classAverage,
        highestMarks: test.highestScore,
        lowestMarks: test.lowestScore,
      };
      return testObj;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      tests: testsWithStats,
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
    console.error("Get tests error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching tests",
    });
  }
};

// Get single test details
export const getTestById = async (req, res) => {
  try {
    const { testId } = req.params;
    const tutorId = req.user._id;

    const test = await Test.findOne({ _id: testId, tutorId })
      .populate("batchId", "name subject students")
      .populate({
        path: "results.studentId",
        select: "studentId personalInfo.parentName userId",
        populate: {
          path: "userId",
          select: "name",
        },
      });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Add statistics
    const testWithStats = test.toObject();
    testWithStats.statistics = {
      totalStudents: test.batchId.students.length,
      resultsUploaded: test.results.length,
      averageMarks: test.classAverage,
      highestMarks: test.highestScore,
      lowestMarks: test.lowestScore,
      passPercentage:
        test.results.length > 0
          ? Math.round(
              (test.results.filter((r) => r.percentage >= 40).length /
                test.results.length) *
                100
            )
          : 0,
    };

    res.status(200).json({
      success: true,
      test: testWithStats,
    });
  } catch (error) {
    console.error("Get test by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching test details",
    });
  }
};

// Upload marks for a test
export const uploadMarks = async (req, res) => {
  try {
    const { testId } = req.params;
    const tutorId = req.user._id;
    const { results } = req.body;

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        message: "Please provide results array",
      });
    }

    const test = await Test.findOne({ _id: testId, tutorId }).populate(
      "batchId",
      "students"
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Validate that all students in results belong to the batch
    const batchStudentIds = test.batchId.students.map((id) => id.toString());
    const resultStudentIds = results.map((result) => result.studentId);

    const invalidStudents = resultStudentIds.filter(
      (id) => !batchStudentIds.includes(id)
    );
    if (invalidStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some students are not enrolled in this batch",
        invalidStudents,
      });
    }

    // Validate marks
    const invalidMarks = results.filter(
      (result) =>
        result.marksObtained < 0 || result.marksObtained > test.totalMarks
    );
    if (invalidMarks.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid marks found. Marks should be between 0 and total marks",
        invalidMarks: invalidMarks.map((r) => ({
          studentId: r.studentId,
          marksObtained: r.marksObtained,
        })),
      });
    }

    // Update test results
    test.results = results.map((result) => ({
      studentId: result.studentId,
      marksObtained: result.marksObtained,
      remarks: result.remarks || "",
    }));

    await test.save();

    // Populate the updated test
    await test.populate({
      path: "results.studentId",
      select: "studentId personalInfo.parentName userId",
      populate: {
        path: "userId",
        select: "name",
      },
    });

    res.status(200).json({
      success: true,
      message: "Marks uploaded successfully",
      test: {
        id: test._id,
        name: test.name,
        totalMarks: test.totalMarks,
        results: test.results,
        statistics: {
          averageMarks: test.classAverage,
          highestMarks: test.highestScore,
          lowestMarks: test.lowestScore,
        },
      },
    });
  } catch (error) {
    console.error("Upload marks error:", error);

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
      message: "Server error uploading marks",
    });
  }
};

// Publish test results
export const publishResults = async (req, res) => {
  try {
    const { testId } = req.params;
    const tutorId = req.user._id;

    const test = await Test.findOne({ _id: testId, tutorId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (test.results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot publish results without uploading marks",
      });
    }

    test.isPublished = true;
    test.status = "completed";
    await test.save();

    res.status(200).json({
      success: true,
      message: "Test results published successfully",
      test: {
        id: test._id,
        name: test.name,
        isPublished: test.isPublished,
        status: test.status,
      },
    });
  } catch (error) {
    console.error("Publish results error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error publishing results",
    });
  }
};

// Get test analytics for a batch
export const getBatchTestAnalytics = async (req, res) => {
  try {
    const { batchId } = req.params;
    const tutorId = req.user._id;
    const { startDate, endDate } = req.query;

    // Verify batch belongs to tutor
    const batch = await Batch.findOne({ _id: batchId, tutorId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Set default date range (last 90 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Get test statistics
    const testStats = await Test.getBatchTestStats(batchId, start, end);

    // Get student performance across tests
    const studentPerformance = await Test.aggregate([
      {
        $match: {
          tutorId,
          batchId: batch._id,
          date: { $gte: start, $lte: end },
          status: "completed",
          isPublished: true,
        },
      },
      {
        $unwind: "$results",
      },
      {
        $group: {
          _id: "$results.studentId",
          totalTests: { $sum: 1 },
          totalMarks: { $sum: "$totalMarks" },
          marksObtained: { $sum: "$results.marksObtained" },
          averagePercentage: { $avg: "$results.percentage" },
          bestPerformance: { $max: "$results.percentage" },
          worstPerformance: { $min: "$results.percentage" },
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
          totalTests: 1,
          averagePercentage: { $round: ["$averagePercentage", 2] },
          bestPerformance: { $round: ["$bestPerformance", 2] },
          worstPerformance: { $round: ["$worstPerformance", 2] },
          overallGrade: {
            $switch: {
              branches: [
                { case: { $gte: ["$averagePercentage", 90] }, then: "A+" },
                { case: { $gte: ["$averagePercentage", 80] }, then: "A" },
                { case: { $gte: ["$averagePercentage", 70] }, then: "B+" },
                { case: { $gte: ["$averagePercentage", 60] }, then: "B" },
                { case: { $gte: ["$averagePercentage", 50] }, then: "C+" },
                { case: { $gte: ["$averagePercentage", 40] }, then: "C" },
                { case: { $gte: ["$averagePercentage", 33] }, then: "D" },
              ],
              default: "F",
            },
          },
        },
      },
      {
        $sort: { averagePercentage: -1 },
      },
    ]);

    // Get subject-wise performance
    const subjectPerformance = await Test.aggregate([
      {
        $match: {
          tutorId,
          batchId: batch._id,
          date: { $gte: start, $lte: end },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$subject",
          testCount: { $sum: 1 },
          averageMarks: { $avg: { $avg: "$results.marksObtained" } },
          totalMarks: { $avg: "$totalMarks" },
        },
      },
      {
        $addFields: {
          averagePercentage: {
            $round: [
              {
                $multiply: [{ $divide: ["$averageMarks", "$totalMarks"] }, 100],
              },
              2,
            ],
          },
        },
      },
      {
        $sort: { averagePercentage: -1 },
      },
    ]);

    const analytics = {
      dateRange: { start, end },
      batchInfo: {
        id: batch._id,
        name: batch.name,
        subject: batch.subject,
        totalStudents: batch.students.length,
      },
      testStatistics: testStats,
      studentPerformance,
      subjectPerformance,
      summary: {
        totalTests: testStats.length,
        averageClassPerformance:
          testStats.length > 0
            ? Math.round(
                testStats.reduce(
                  (sum, test) =>
                    sum + (test.averageMarks / test.totalMarks) * 100,
                  0
                ) / testStats.length
              )
            : 0,
        topPerformer: studentPerformance[0] || null,
        studentsAbove80: studentPerformance.filter(
          (s) => s.averagePercentage >= 80
        ).length,
        studentsBelow40: studentPerformance.filter(
          (s) => s.averagePercentage < 40
        ).length,
      },
    };

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get batch test analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching test analytics",
    });
  }
};

// Get student test performance
export const getStudentTestPerformance = async (req, res) => {
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

    // Get student performance
    const performance = await Test.getStudentPerformance(
      studentId,
      batchId !== "all" ? batchId : student.batches[0]._id
    );

    // Calculate statistics
    const stats = {
      totalTests: performance.length,
      averagePercentage:
        performance.length > 0
          ? Math.round(
              performance.reduce((sum, test) => sum + test.percentage, 0) /
                performance.length
            )
          : 0,
      bestPerformance:
        performance.length > 0
          ? Math.max(...performance.map((t) => t.percentage))
          : 0,
      worstPerformance:
        performance.length > 0
          ? Math.min(...performance.map((t) => t.percentage))
          : 0,
      testsAbove80: performance.filter((t) => t.percentage >= 80).length,
      testsBelow40: performance.filter((t) => t.percentage < 40).length,
    };

    // Calculate overall grade
    let overallGrade = "F";
    if (stats.averagePercentage >= 90) overallGrade = "A+";
    else if (stats.averagePercentage >= 80) overallGrade = "A";
    else if (stats.averagePercentage >= 70) overallGrade = "B+";
    else if (stats.averagePercentage >= 60) overallGrade = "B";
    else if (stats.averagePercentage >= 50) overallGrade = "C+";
    else if (stats.averagePercentage >= 40) overallGrade = "C";
    else if (stats.averagePercentage >= 33) overallGrade = "D";

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.userId.name,
        batches: student.batches,
      },
      stats: { ...stats, overallGrade },
      performance,
    });
  } catch (error) {
    console.error("Get student test performance error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student performance",
    });
  }
};

// Update test details
export const updateTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const tutorId = req.user._id;
    const updates = req.body;

    const test = await Test.findOne({ _id: testId, tutorId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Don't allow updating if results are already uploaded
    if (test.results.length > 0 && (updates.totalMarks || updates.batchId)) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify total marks or batch after uploading results",
      });
    }

    // Update test
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined && key !== "results") {
        test[key] = updates[key];
      }
    });

    await test.save();
    await test.populate("batchId", "name subject");

    res.status(200).json({
      success: true,
      message: "Test updated successfully",
      test,
    });
  } catch (error) {
    console.error("Update test error:", error);

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
      message: "Server error updating test",
    });
  }
};

// Delete test
export const deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const tutorId = req.user._id;

    const test = await Test.findOne({ _id: testId, tutorId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Don't allow deletion if results are published
    if (test.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete published test",
      });
    }

    await Test.findByIdAndDelete(testId);

    res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    console.error("Delete test error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting test",
    });
  }
};
