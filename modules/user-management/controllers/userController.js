import asyncHandler from "../../../utils/asyncHandler.js"
import { ApiResponse } from "../../../utils/responseHandler.js"
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    changeUserRole,
} from "../services/userService.js"

// Get all users
export const getAllUsersController = asyncHandler(async (req, res) => {
    const users = await getAllUsers()
    return res
        .status(200)
        .json(ApiResponse(200, users, "Users retrieved successfully"))
})

// Get user by ID
export const getUserByIdController = asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id)
    if (!user) {
        return res.status(404).json(ApiResponse(404, null, "User not found"))
    }
    return res
        .status(200)
        .json(ApiResponse(200, user, "User retrieved successfully"))
})

// Create a new user
export const createUserController = asyncHandler(async (req, res) => {
    const newUser = await createUser(req.body)
    return res
        .status(201)
        .json(ApiResponse(201, newUser, "User created successfully"))
})

// Update an existing user
export const updateUserController = asyncHandler(async (req, res) => {
    const updatedUser = await updateUser(req.params.id, req.body)
    return res
        .status(200)
        .json(ApiResponse(200, updatedUser, "User updated successfully"))
})

// Delete (soft delete) a user
export const deleteUserController = asyncHandler(async (req, res) => {
    const deletedUser = await deleteUser(req.params.id)
    return res
        .status(200)
        .json(ApiResponse(200, deletedUser, "User deleted successfully"))
})

// Update user status (active/inactive/suspended)
export const updateUserStatusController = asyncHandler(async (req, res) => {
    const updatedUser = await updateUserStatus(req.params.id, req.body.status)
    return res
        .status(200)
        .json(ApiResponse(200, updatedUser, "User status updated successfully"))
})

// Change user role
export const changeUserRoleController = asyncHandler(async (req, res) => {
    const updatedUser = await changeUserRole(req.params.id, req.body.role)
    return res
        .status(200)
        .json(ApiResponse(200, updatedUser, "User role updated successfully"))
})
