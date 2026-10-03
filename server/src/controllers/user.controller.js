import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isDemoMode } from "../utils/demoMode.js";
import { getDemoUser } from "../utils/demoStore.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 4 * 24 * 60 * 60 * 1000,
};
const clearCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const getPublicUser = (user) => {
  const publicUser = user.toObject();
  delete publicUser.password;
  return publicUser;
};

const registerUser = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    throw new ApiError(403, "Sign up is disabled in demo mode. Use the demo account to try the app.");
  }

  const { username, email, password } = req.body;
  if (!username?.trim() || !email?.trim() || !password) {
    throw new ApiError(400, "Username, email and password are required");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  const profileImageLocalPath = req.file?.path;
  if (!profileImageLocalPath) {
    throw new ApiError(400, "Profile image is required");
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.trim().toLowerCase() }, { username: username.trim() }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const profileImage = await uploadOnCloudinary(profileImageLocalPath);
  const user = await User.create({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
    profileImage,
  });
  const accessToken = user.generateAccessToken();

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { accessToken, user: getPublicUser(user) },
        "User registered successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  if (isDemoMode) {
    if (
      email.trim().toLowerCase() !== "demo@todo.local" ||
      password !== "demo1234"
    ) {
      throw new ApiError(401, "Use the demo account credentials shown on this page");
    }
    return res
      .status(200)
      .cookie("accessToken", "demo-session", cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken: "demo-session", user: getDemoUser() },
          "Logged in to the demo account",
        ),
      );
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user || !(await user.isPasswordMatched(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = user.generateAccessToken();
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, user: getPublicUser(user) },
        "User logged in successfully",
      ),
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, "Current user fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getAppStatus = asyncHandler(async (req, res) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  let user = null;

  if (isDemoMode) {
    if (token === "demo-session") user = getDemoUser();
  } else if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      user = await User.findById(decodedToken.userId).select("-password");
    } catch (error) {
      if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
        throw error;
      }
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { demoMode: isDemoMode, user }, "App status fetched"));
});

export { registerUser, loginUser, getCurrentUser, getAppStatus, logoutUser };
