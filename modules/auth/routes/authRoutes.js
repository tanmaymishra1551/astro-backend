// modules/auth/routes/authRoutes.js
import { Router } from "express"
import * as authController from "../controllers/authController.js"

const router = Router()

router.get("/test", authController.testController)
router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)

export default router
