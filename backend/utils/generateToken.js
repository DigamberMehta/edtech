import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || process.env.SECERT_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const responseData = {
    success: true,
    message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
    token,
  };

  res.status(200).cookie("token", token, cookieOptions).json(responseData);

  return { token, user: responseData.user };
};
