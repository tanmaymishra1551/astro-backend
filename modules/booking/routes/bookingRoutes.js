// modules/booking/routes/bookingRoutes.js
import { Router } from "express"
import * as bookingController from "../controllers/bookingController.js"

const router = Router()

router.post("/astrologer/available-slots", bookingController.getAvailableTimeSlots)
router.post("/create", bookingController.createBooking)
router.put("/update/:bookingId", bookingController.updateBookingStatus)

export default router
