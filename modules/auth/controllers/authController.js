import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "../../../utils/asyncHandler.js";
import {
    createUser,
    getUserByUsernameOrEmail,
    findOne,
    findById,
    updateRefreshToken,
    loggedInUserDetails,
} from "../services/authService.js";
import { ApiError, ApiResponse } from "../../../utils/responseHandler.js";

// Test Route
export const testController = asyncHandler(async (req, res) => {
    return res.status(200).json(ApiResponse(200, null, "Test controller is working"));
});

// Register User
export const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password, role, phone } = req.body;

    if (![fullname, email, username, password, role].every((field) => field?.trim())) {
        return ApiError(400, "All fields are required");
    }

    if (await getUserByUsernameOrEmail(username, email)) {
        return ApiError(409, "User with email or username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
        fullname,
        email,
        username: username.toLowerCase(),
        password: hashedPassword,
        role,
        phone,
    });

    if (!user) return ApiError(500, "Something went wrong while registering the user");

    return res.status(201).json(ApiResponse(201, user, "User registered successfully"));
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;
    if (!phone) return ApiError(400, "Phone number is required");

    const user = await findOne(phone);
    if (!user) return ApiError(404, "User does not exist");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return ApiError(401, "Invalid user credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);
    const loggedInUser = await loggedInUserDetails(user.id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
        .json(ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

// Generate Access & Refresh Tokens
export const generateAccessAndRefreshTokens = async (userId) => {
    const user = await findById(userId);
    if (!user) throw new Error("User not found");

    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    await updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
};

// Refresh Access Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) return ApiError(401, "Unauthorized request");

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await findById(decodedToken.id);

        if (!user || incomingRefreshToken !== user.refreshToken) {
            return ApiError(401, "Refresh token is expired or invalid");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user.id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
            .json(ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    } catch (error) {
        return ApiError(401, error.message || "Invalid refresh token");
    }
});
