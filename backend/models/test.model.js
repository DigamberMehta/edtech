import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Test name is required"],
      trim: true,
      maxlength: [100, "Test name cannot exceed 100 characters"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Test date is required"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: [1, "Total marks must be at least 1"],
      max: [1000, "Total marks cannot exceed 1000"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [15, "Duration must be at least 15 minutes"],
      max: [300, "Duration cannot exceed 300 minutes"],
    },
    instructions: {
      type: String,
      maxlength: [1000, "Instructions cannot exceed 1000 characters"],
    },
    results: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        marksObtained: {
          type: Number,
          required: true,
          min: [0, "Marks cannot be negative"],
          validate: {
            validator: function (value) {
              return value <= this.parent().totalMarks;
            },
            message: "Marks obtained cannot exceed total marks",
          },
        },
        percentage: {
          type: Number,
          min: [0, "Percentage cannot be negative"],
          max: [100, "Percentage cannot exceed 100"],
        },
        grade: {
          type: String,
          enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
          trim: true,
        },
        rank: {
          type: Number,
          min: [1, "Rank must be at least 1"],
        },
        remarks: {
          type: String,
          maxlength: [200, "Remarks cannot exceed 200 characters"],
        },
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
testSchema.index({ tutorId: 1 });
testSchema.index({ batchId: 1 });
testSchema.index({ date: 1 });
testSchema.index({ status: 1 });
testSchema.index({ "results.studentId": 1 });

// Calculate percentage and grade before saving results
testSchema.pre("save", function (next) {
  if (this.results && this.results.length > 0) {
    this.results.forEach((result) => {
      // Calculate percentage
      result.percentage = Math.round(
        (result.marksObtained / this.totalMarks) * 100
      );

      // Calculate grade based on percentage
      if (result.percentage >= 90) result.grade = "A+";
      else if (result.percentage >= 80) result.grade = "A";
      else if (result.percentage >= 70) result.grade = "B+";
      else if (result.percentage >= 60) result.grade = "B";
      else if (result.percentage >= 50) result.grade = "C+";
      else if (result.percentage >= 40) result.grade = "C";
      else if (result.percentage >= 33) result.grade = "D";
      else result.grade = "F";
    });

    // Calculate ranks
    const sortedResults = [...this.results].sort(
      (a, b) => b.marksObtained - a.marksObtained
    );
    sortedResults.forEach((result, index) => {
      const originalResult = this.results.find(
        (r) => r.studentId.toString() === result.studentId.toString()
      );
      if (originalResult) {
        originalResult.rank = index + 1;
      }
    });
  }
  next();
});

// Virtual for class average
testSchema.virtual("classAverage").get(function () {
  if (this.results && this.results.length > 0) {
    const totalMarks = this.results.reduce(
      (sum, result) => sum + result.marksObtained,
      0
    );
    return Math.round((totalMarks / this.results.length) * 100) / 100;
  }
  return 0;
});

// Virtual for highest score
testSchema.virtual("highestScore").get(function () {
  if (this.results && this.results.length > 0) {
    return Math.max(...this.results.map((result) => result.marksObtained));
  }
  return 0;
});

// Virtual for lowest score
testSchema.virtual("lowestScore").get(function () {
  if (this.results && this.results.length > 0) {
    return Math.min(...this.results.map((result) => result.marksObtained));
  }
  return 0;
});

// Static method to get test statistics for batch
testSchema.statics.getBatchTestStats = async function (
  batchId,
  startDate,
  endDate
) {
  const pipeline = [
    {
      $match: {
        batchId: new mongoose.Types.ObjectId(batchId),
        date: { $gte: startDate, $lte: endDate },
        status: "completed",
      },
    },
    {
      $unwind: "$results",
    },
    {
      $group: {
        _id: "$_id",
        testName: { $first: "$name" },
        date: { $first: "$date" },
        totalMarks: { $first: "$totalMarks" },
        averageMarks: { $avg: "$results.marksObtained" },
        highestMarks: { $max: "$results.marksObtained" },
        lowestMarks: { $min: "$results.marksObtained" },
        totalStudents: { $sum: 1 },
      },
    },
    {
      $sort: { date: -1 },
    },
  ];

  return await this.aggregate(pipeline);
};

// Static method to get student performance across tests
testSchema.statics.getStudentPerformance = async function (studentId, batchId) {
  const pipeline = [
    {
      $match: {
        batchId: new mongoose.Types.ObjectId(batchId),
        status: "completed",
        isPublished: true,
      },
    },
    {
      $unwind: "$results",
    },
    {
      $match: {
        "results.studentId": new mongoose.Types.ObjectId(studentId),
      },
    },
    {
      $project: {
        testName: "$name",
        subject: "$subject",
        date: "$date",
        totalMarks: "$totalMarks",
        marksObtained: "$results.marksObtained",
        percentage: "$results.percentage",
        grade: "$results.grade",
        rank: "$results.rank",
      },
    },
    {
      $sort: { date: -1 },
    },
  ];

  return await this.aggregate(pipeline);
};

const Test = mongoose.model("Test", testSchema);

export default Test;
