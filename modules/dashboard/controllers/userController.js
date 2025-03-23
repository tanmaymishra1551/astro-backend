import asyncHandler from "../../../utils/asyncHandler.js"
import { getAllUsers} from "../../auth/services/authService.js"
import { ApiResponse } from "../../../utils/responseHandler.js"
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";
import fs from "fs";
import { updateProfileImage } from "../services/profileImageService.js";

export const getAllUsersController = asyncHandler(async (req, res) => {
    const users = await getAllUsers()
    return res
        .status(200)
        .json(ApiResponse(200, users, "Users retrieved successfully"))
})

export const editProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const localFilePath = req.file.path;

    // Upload to Cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (!cloudinaryResponse) {
        return res.status(500).json({ success: false, message: "Failed to upload image" });
    }

    const imageUrl = cloudinaryResponse.url;
    const userId = req.user.id; // Assuming user ID is available from authentication middleware

    // Store in PostgreSQL
    const updatedUser = await updateProfileImage(userId, imageUrl);

    // Delete local file after upload
    fs.unlinkSync(localFilePath);

    return res.status(200).json({ 
        success: true, 
        message: "Profile image updated successfully", 
        imageUrl,
        user: updatedUser 
    });
});
