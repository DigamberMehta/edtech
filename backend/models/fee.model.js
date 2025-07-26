import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    feeType: {
      type: String,
      enum: ["monthly", "registration", "exam", "material", "other"],
      default: "monthly",
    },
    month: {
      type: String,
      required: function () {
        return this.feeType === "monthly";
      },
      match: [
        /^\d{4}-(0[1-9]|1[0-2])$/,
        "Please enter valid month format (YYYY-MM)",
      ],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank_transfer", "cheque"],
      required: function () {
        return this.status === "paid";
      },
    },
    transactionId: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      maxlength: [200, "Remarks cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
feeSchema.index({ tutorId: 1 });
feeSchema.index({ studentId: 1 });
feeSchema.index({ batchId: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });
feeSchema.index({ month: 1 });

// Compound index for unique monthly fee per student per batch
feeSchema.index(
  { studentId: 1, batchId: 1, month: 1, feeType: 1 },
  {
    unique: true,
    partialFilterExpression: { feeType: "monthly" },
  }
);

// Update status to overdue for fees past due date
feeSchema.pre("save", function (next) {
  if (this.status === "pending" && this.dueDate < new Date()) {
    this.status = "overdue";
  }
  next();
});

// Static method to get fee statistics for tutor
feeSchema.statics.getTutorStats = async function (tutorId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        tutorId: new mongoose.Types.ObjectId(tutorId),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ];

  return await this.aggregate(pipeline);
};

// Static method to get monthly collection report
feeSchema.statics.getMonthlyReport = async function (tutorId, year) {
  const pipeline = [
    {
      $match: {
        tutorId: new mongoose.Types.ObjectId(tutorId),
        status: "paid",
        paidDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$paidDate" },
          year: { $year: "$paidDate" },
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  ];

  return await this.aggregate(pipeline);
};

// Virtual for days overdue
feeSchema.virtual("daysOverdue").get(function () {
  if (this.status === "overdue") {
    const today = new Date();
    const diffTime = today - this.dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

const Fee = mongoose.model("Fee", feeSchema);

export default Fee;
