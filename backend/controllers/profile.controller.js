import User from "../models/user.model.js";
import Tutor from "../models/tutor.model.js";
import Student from "../models/student.model.js";

// Get complete user profile based on role
export const getCompleteProfile = async (req, res) => {
  try {
    const user = req.user;
    let profileData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    };

    if (user.role === "tutor") {
      const tutorProfile = await Tutor.findOne({ userId: user._id });
      profileData.tutorProfile = tutorProfile;
    } else if (user.role === "student") {
      const studentProfile = await Student.findOne({ userId: user._id })
        .populate("tutorId", "name email profile.phone")
        .populate("batches", "name subject schedule");
      profileData.studentProfile = studentProfile;
    }

    res.status(200).json({
      success: true,
      profile: profileData,
    });
  } catch (error) {
    console.error("Get complete profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching complete profile",
    });
  }
};

// Upload profile image (placeholder for future implementation)
export const uploadProfileImage = async (req, res) => {
  try {
    // This would typically handle file upload using multer
    // For now, we'll just update the profileImage field with a URL
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Please provide image URL",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profile.profileImage = imageUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: imageUrl,
    });
  } catch (error) {
    console.error("Upload profile image error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error uploading profile image",
    });
  }
};

// Deactivate user account
export const deactivateAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide password to confirm account deactivation",
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

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Deactivate account
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deactivating account",
    });
  }
};

// Get user activity log (placeholder for future implementation)
export const getUserActivity = async (req, res) => {
  try {
    // This would typically fetch user activity from a separate activity log collection
    // For now, we'll return basic user information
    const user = req.user;

    const activity = {
      lastLogin: user.lastLogin,
      accountCreated: user.createdAt,
      accountStatus: user.isActive ? "Active" : "Inactive",
      role: user.role,
    };

    res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching user activity",
    });
  }
};
