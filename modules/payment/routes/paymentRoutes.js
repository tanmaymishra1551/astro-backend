// modules/payment/routes/paymentRoutes.js
import { Router } from "express"
import * as paymentController from "../controllers/paymentController.js"

const router = Router()
router.post("/initiate", paymentController.initiatePayment)
router.post("/callback", paymentController.handlePaymentCallback)

export default router
