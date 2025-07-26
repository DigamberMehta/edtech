import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        status: {
          type: String,
          enum: ["present", "absent", "late"],
          required: true,
        },
        remarks: {
          type: String,
          maxlength: [200, "Remarks cannot exceed 200 characters"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
attendanceSchema.index({ tutorId: 1 });
attendanceSchema.index({ batchId: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ "records.studentId": 1 });

// Compound index for unique attendance per batch per date
attendanceSchema.index({ batchId: 1, date: 1 }, { unique: true });

// Static method to get attendance statistics for a student
attendanceSchema.statics.getStudentStats = async function (
  studentId,
  batchId,
  startDate,
  endDate
) {
  const pipeline = [
    {
      $match: {
        batchId: new mongoose.Types.ObjectId(batchId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: "$records",
    },
    {
      $match: {
        "records.studentId": new mongoose.Types.ObjectId(studentId),
      },
    },
    {
      $group: {
        _id: "$records.status",
        count: { $sum: 1 },
      },
    },
  ];

  return await this.aggregate(pipeline);
};

// Static method to get batch attendance statistics
attendanceSchema.statics.getBatchStats = async function (
  batchId,
  startDate,
  endDate
) {
  const pipeline = [
    {
      $match: {
        batchId: new mongoose.Types.ObjectId(batchId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: "$records",
    },
    {
      $group: {
        _id: {
          date: "$date",
          status: "$records.status",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        present: {
          $sum: {
            $cond: [{ $eq: ["$_id.status", "present"] }, "$count", 0],
          },
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ["$_id.status", "absent"] }, "$count", 0],
          },
        },
        late: {
          $sum: {
            $cond: [{ $eq: ["$_id.status", "late"] }, "$count", 0],
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  return await this.aggregate(pipeline);
};

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
