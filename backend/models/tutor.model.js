import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    institute: {
      name: {
        type: String,
        required: [true, "Institute name is required"],
        trim: true,
        maxlength: [100, "Institute name cannot exceed 100 characters"],
      },
      address: {
        type: String,
        maxlength: [200, "Address cannot exceed 200 characters"],
      },
      phone: {
        type: String,
        match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
      },
      email: {
        type: String,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
    },
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      max: [50, "Experience cannot exceed 50 years"],
    },
    qualifications: [
      {
        type: String,
        trim: true,
      },
    ],
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      whatsapp: {
        type: Boolean,
        default: false,
      },
      emailReminders: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index is automatically created by unique: true constraint

const Tutor = mongoose.model("Tutor", tutorSchema);

export default Tutor;
