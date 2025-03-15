// modules/chat/routes/chatRoutes.js
import { Router } from "express"
import { uploadFile } from "../controllers/chatController.js"

const router = Router()
router.post("/upload", uploadFile)

export default router
