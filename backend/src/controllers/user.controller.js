import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

console.log("Hey there");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validationBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token",
    );
  }
};

// 📝 REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
  console.log("🔥 REGISTER API HIT 🔥");
  const { fullName, phone, email, password, role } = req.body;

  if (
    [fullName, phone, email, password, role].some(
      (field) => field?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const allowedRoles = ["victim", "volunteer", "ngo"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const existedUser = await User.findOne({
    $or: [{ phone }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    fullName,
    phone,
    email,
    password,
    role,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// 🔓 LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  console.log("Login")
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const existedUser = await User.findOne({ email });
  if (!existedUser) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existedUser._id,
  );

  const loggedUser = await User.findById(existedUser._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none", // 👈 CORS handle karne ke liye hamesha behtar rehta h
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully",
      ),
    );
});

// 👤 GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
  // Pure production format setup
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// 🏃‍♂️ LOGOUT USER (Wrapped securely inside asyncHandler)
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  // Apne logoutUser controller me findByIdAndUpdate ke options ko aise badlo:

  if (userId) {
    await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } },
      { returnDocument: "after" }, // 👈 'new: true' ki jagah ye likh do, warning gayab!
    );
  }

  console.log("Tanya Sahu");
  console.log(req.user.refreshToken);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  };

  console.log("Chala");

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logged out successfully!")); // Standard ApiResponse wrapper pattern use kiya yahan bhi!
});

// 🌟 Sabhi ko line se sahi se export kiya!
export { registerUser, loginUser, getCurrentUser, logoutUser };

/**Galti: Mongoose ke $set mein undefined pass karne par Mongoose use ignore kar deta hai, isliye database mein token delete nahi ho raha tha.

Solution: $set: { refreshToken: undefined } ki jagah $unset: { refreshToken: 1 } ka use karo, yeh field ko database se completely remove kar dega. */
