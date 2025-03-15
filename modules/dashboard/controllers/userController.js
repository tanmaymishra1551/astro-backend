import asyncHandler from "../../../utils/asyncHandler.js"
import { getAllUsers} from "../../auth/services/authService.js"
import { ApiResponse } from "../../../utils/responseHandler.js"

export const getAllUsersController = asyncHandler(async (req, res) => {
    const users = await getAllUsers()
    return res
        .status(200)
        .json(ApiResponse(200, users, "Users retrieved successfully"))
})
