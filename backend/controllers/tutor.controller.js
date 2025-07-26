import User from "../models/user.model.js";
import Tutor from "../models/tutor.model.js";

// Get tutor profile with institute details
export const getTutorProfile = async (req, res) => {
  try {
    const tutorProfile = await Tutor.findOne({ userId: req.user._id }).populate(
      "userId",
      "-password"
    );

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      tutor: tutorProfile,
    });
  } catch (error) {
    console.error("Get tutor profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching tutor profile",
    });
  }
};

// Create or update tutor profile
export const updateTutorProfile = async (req, res) => {
  try {
    const { institute, subjects, experience, qualifications, settings } =
      req.body;

    // Find existing tutor profile or create new one
    let tutorProfile = await Tutor.findOne({ userId: req.user._id });

    if (tutorProfile) {
      // Update existing profile
      if (institute)
        tutorProfile.institute = { ...tutorProfile.institute, ...institute };
      if (subjects) tutorProfile.subjects = subjects;
      if (experience !== undefined) tutorProfile.experience = experience;
      if (qualifications) tutorProfile.qualifications = qualifications;
      if (settings)
        tutorProfile.settings = { ...tutorProfile.settings, ...settings };

      await tutorProfile.save();
    } else {
      // Create new tutor profile
      tutorProfile = await Tutor.create({
        userId: req.user._id,
        institute: institute || {},
        subjects: subjects || [],
        experience: experience || 0,
        qualifications: qualifications || [],
        settings: settings || {},
      });
    }

    // Populate user data
    await tutorProfile.populate("userId", "-password");

    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully",
      tutor: tutorProfile,
    });
  } catch (error) {
    console.error("Update tutor profile error:", error);

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
      message: "Server error updating tutor profile",
    });
  }
};

// Update user basic information (name, email, phone, address)
export const updateUserInfo = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update basic user info
    if (name) user.name = name;
    if (phone) user.profile.phone = phone;
    if (address) user.profile.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User information updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Update user info error:", error);

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
      message: "Server error updating user information",
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password",
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

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
      message: "Server error changing password",
    });
  }
};

// Get tutor dashboard stats
export const getTutorStats = async (req, res) => {
  try {
    // Import models here to avoid circular dependency
    const Student = (await import("../models/student.model.js")).default;
    const Batch = (await import("../models/batch.model.js")).default;
    const Fee = (await import("../models/fee.model.js")).default;
    const Test = (await import("../models/test.model.js")).default;

    const tutorId = req.user._id;

    // Get basic counts
    const [studentCount, batchCount, totalFees, upcomingTests] =
      await Promise.all([
        Student.countDocuments({ tutorId, status: "active" }),
        Batch.countDocuments({ tutorId, status: "active" }),
        Fee.aggregate([
          { $match: { tutorId, status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Test.countDocuments({
          tutorId,
          status: "scheduled",
          date: { $gte: new Date() },
        }),
      ]);

    const stats = {
      totalStudents: studentCount,
      activeBatches: batchCount,
      feesCollected: totalFees[0]?.total || 0,
      upcomingTests: upcomingTests,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get tutor stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching tutor statistics",
    });
  }
};
