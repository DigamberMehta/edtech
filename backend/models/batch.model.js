import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
      maxlength: [100, "Batch name cannot exceed 100 characters"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    schedule: {
      days: [
        {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
      ],
      startTime: {
        type: String,
        required: [true, "Start time is required"],
        match: [
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Please enter valid time format (HH:MM)",
        ],
      },
      endTime: {
        type: String,
        required: [true, "End time is required"],
        match: [
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Please enter valid time format (HH:MM)",
        ],
      },
      duration: {
        type: Number,
        required: true,
        min: [30, "Duration must be at least 30 minutes"],
        max: [300, "Duration cannot exceed 300 minutes"],
      },
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [100, "Capacity cannot exceed 100"],
    },
    feeStructure: {
      monthlyFee: {
        type: Number,
        required: [true, "Monthly fee is required"],
        min: [0, "Fee cannot be negative"],
      },
      registrationFee: {
        type: Number,
        default: 0,
        min: [0, "Registration fee cannot be negative"],
      },
      currency: {
        type: String,
        default: "INR",
        enum: ["INR", "USD", "EUR"],
      },
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
batchSchema.index({ tutorId: 1 });
batchSchema.index({ status: 1 });
batchSchema.index({ subject: 1 });

// Virtual for current enrollment count
batchSchema.virtual("currentEnrollment").get(function () {
  return this.students.length;
});

// Virtual for available spots
batchSchema.virtual("availableSpots").get(function () {
  return this.capacity - this.students.length;
});

// Check if batch has capacity before adding student
batchSchema.methods.hasCapacity = function () {
  return this.students.length < this.capacity;
};

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;
