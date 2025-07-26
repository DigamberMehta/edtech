import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { createSession, removeSession } from "../middlewares/sessionManager.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user (password will be hashed by the pre-save middleware)
    const newUser = await User.create({
      name,
      email,
      password,
      role,
    });

    // Generate token and create session
    const tokenData = generateToken(
      res,
      newUser,
      `Account created successfully! Welcome ${newUser.name}`
    );
    createSession(newUser._id, tokenData.token);
  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors
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
      message: "Server error during registration",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Compare password using the model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token and create session
    const tokenData = generateToken(res, user, `Welcome back, ${user.name}!`);
    createSession(user._id, tokenData.token);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Remove session
    if (req.user && req.user._id) {
      removeSession(req.user._id);
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // User is already attached to req by authenticateUser middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // User is already authenticated by middleware
    const tokenData = generateToken(
      res,
      req.user,
      "Token refreshed successfully"
    );
    createSession(req.user._id, tokenData.token);
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error refreshing token",
    });
  }
};
