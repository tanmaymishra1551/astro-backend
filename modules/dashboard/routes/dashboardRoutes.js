import express from "express"
import { getAllUsersController } from "../controllers/userController.js"
import { getAllAstrologerController } from "../controllers/astrologerController.js"
const router = express.Router()

router.get("/users", getAllUsersController)
router.get("/astrologer", getAllAstrologerController)

export default router
