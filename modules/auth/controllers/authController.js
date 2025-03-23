import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import asyncHandler from "../../../utils/asyncHandler.js"
import {
    createUser,
    getUserByUsernameOrEmail,
    findOne,
    findById,
    updateRefreshToken,
    loggedInUserDetails,
} from "../services/authService.js"
import { ApiError, ApiResponse } from "../../../utils/responseHandler.js"

export const testController = asyncHandler(async (req, res) => {
    return res.status(200).json(ApiResponse(200, null, "Test controller is working"))
})

export const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password, role } = req.body
    console.log(req.body)
    if (
        [fullname, email, username, password, role].some(
            (field) => !field?.trim()
        )
) {
        ApiError(400, "All fields are required")
    }
console.log(`Wokring fine`);
    const existingUser = await getUserByUsernameOrEmail(username, email)
    console.log (`Existing user is ${existingUser}`);
    if (existingUser) {
        ApiError(409, "User with email or username already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await createUser({
        fullname,
        email,
        username: username.toLowerCase(),
        password: hashedPassword,
        role,
    })

    if (!user) {
        ApiError(500, "Something went wrong while registering the user")
    }
    return res
.status(201)
        .json(ApiResponse(200, user, "User registered successfully"))
})

export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

     console.log(`Username: ${username}, Password: ${password}`)
    if (!username && !email) {
        ApiError(400, "Username or email is required")
    }

    // Find user by username or email
    const user = await findOne(username, email)

    if (!user) {
        ApiError(404, "User does not exist")
    }
     let User = JSON.stringify(user)
     console.log(`User: ${User}`)
    //  Check password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        ApiError(401, "Invalid user credentials")
}

    // Generate JWT token
    const tokenPayload = { id: user.id, role: user.role }
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "2h",
    })

    // Generate access & refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user.id
    )

    // Prepare user object without sensitive fields
    const loggedInUser = await loggedInUserDetails(user.id)
    // Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options).json(
            ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                    jwtToken: token, // Added JWT token
                },
                "User logged in successfully"
            )
        )
})

//Check below function can be used as common function
export const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // Fetch user from PostgreSQL
        const loggeUser = await findById(userId)
        if (loggeUser === "") {
            throw new Error("User not found")
        }

        const user = loggeUser
        // Generate tokens
 const accessToken = jwt.sign(
            { id: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "15m",
            }
        )

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: "7d",
            }
        )

        // Store refresh token in the database
        const token = await updateRefreshToken(user.id, refreshToken)
        return token
    } catch (error) {
        console.error("Error generating tokens:", error.message)
        throw new Error(
            "Something went wrong while generating access and refresh tokens"
        )
    }
}

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await findById(decodedToken?._id)

        if (!user) {
            ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            ApiError(401, "Refresh token is expired or used")
}

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefereshTokens(user_id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        ApiError(401, error?.message || "Invalid refresh token")
    }
})