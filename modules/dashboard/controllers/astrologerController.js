import asyncHandler from "../../../utils/asyncHandler.js"
import { getAllAstrologer } from "../../auth/services/authService.js"
import { ApiResponse } from "../../../utils/responseHandler.js"

export const getAllAstrologerController = asyncHandler(async (req, res) => {
    const users = await getAllAstrologer()
    return res
        .status(200)
        .json(ApiResponse(200, users, "Astrologers retrieved successfully"))
})
