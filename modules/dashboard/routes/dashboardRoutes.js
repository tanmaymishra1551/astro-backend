import express from "express"
import { getAllUsersController } from "../controllers/userController.js"
import { getAllAstrologerController } from "../controllers/astrologerController.js"
import { editProfileImage } from "../controllers/userController.js";
import { upload } from "../../../utils/multer.js";

const router = express.Router()

router.get("/users", getAllUsersController)
router.get("/astrologer", getAllAstrologerController)
router.post("/edit-profile-image", upload.single("profileImage"), editProfileImage);

export default router
