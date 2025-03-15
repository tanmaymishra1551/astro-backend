// modules/user-management/routes/userRoutes.js
import { Router } from "express"
import {
    getAllUsersController,
    getUserByIdController,
    createUserController,
    updateUserController,
    deleteUserController,
    updateUserStatusController,
    changeUserRoleController,
} from "../controllers/userController.js"

const router = Router()

// GET all users with optional filters (role, status)
router.get("/", getAllUsersController)

// GET a single user by ID
router.get("/:id", getUserByIdController)

// Create a new user
router.post("/", createUserController)

// Update user details
router.put("/:id", updateUserController)

// Soft delete a user (update status to inactive)
router.delete("/:id", deleteUserController)

// Update user status (active/inactive/suspended)
router.patch("/:id/status", updateUserStatusController)

// Change user role
router.patch("/:id/role",  changeUserRoleController)

export default router
