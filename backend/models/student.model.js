import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: String,
      unique: true,
      trim: true,
    },
    personalInfo: {
      parentName: {
        type: String,
        required: [true, "Parent name is required"],
        trim: true,
        maxlength: [50, "Parent name cannot exceed 50 characters"],
      },
      parentPhone: {
        type: String,
        required: [true, "Parent phone is required"],
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
      },
      parentEmail: {
        type: String,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
      dateOfBirth: {
        type: Date,
        required: [true, "Date of birth is required"],
      },
      class: {
        type: String,
        required: [true, "Class is required"],
        trim: true,
      },
      school: {
        type: String,
        trim: true,
        maxlength: [100, "School name cannot exceed 100 characters"],
      },
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance (userId and studentId indexes are automatically created by unique: true)
studentSchema.index({ tutorId: 1 });
studentSchema.index({ status: 1 });

// Generate unique student ID
studentSchema.pre("save", async function (next) {
  if (!this.studentId) {
    const count = await mongoose
      .model("Student")
      .countDocuments({ tutorId: this.tutorId });
    this.studentId = `STU${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
