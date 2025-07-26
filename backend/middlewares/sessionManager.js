import jwt from "jsonwebtoken";

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Store for active sessions (in production, use Redis or database)
const activeSessions = new Map();

export const createSession = (userId, token) => {
  const sessionData = {
    userId,
    token,
    createdAt: new Date(),
    lastActivity: new Date(),
  };

  activeSessions.set(userId.toString(), sessionData);
  return sessionData;
};

export const updateSessionActivity = (userId) => {
  const session = activeSessions.get(userId.toString());
  if (session) {
    session.lastActivity = new Date();
    activeSessions.set(userId.toString(), session);
  }
};

export const removeSession = (userId) => {
  activeSessions.delete(userId.toString());
};

export const isSessionValid = (userId) => {
  const session = activeSessions.get(userId.toString());
  if (!session) return false;

  const now = new Date();
  const timeSinceLastActivity = now - session.lastActivity;

  if (timeSinceLastActivity > SESSION_TIMEOUT) {
    activeSessions.delete(userId.toString());
    return false;
  }

  return true;
};

export const cleanupExpiredSessions = () => {
  const now = new Date();

  for (const [userId, session] of activeSessions.entries()) {
    const timeSinceLastActivity = now - session.lastActivity;

    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      activeSessions.delete(userId);
    }
  }
};

// Cleanup expired sessions every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

// Middleware to check session validity
export const validateSession = (req, res, next) => {
  if (req.user && req.user._id) {
    if (!isSessionValid(req.user._id)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // Update session activity
    updateSessionActivity(req.user._id);
  }

  next();
};
