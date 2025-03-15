// modules/payment/controllers/paymentController.js
import * as paymentService from "../services/paymentService.js"

export const initiatePayment = async (req, res) => {
    try {
        const { bookingId, amount, upiId } = req.body
        const paymentDetails = await paymentService.initiatePayment({
            bookingId,
            amount,
            upiId,
        })
        res.status(200).json(paymentDetails)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const handlePaymentCallback = async (req, res) => {
    try {
        await paymentService.handlePaymentCallback(req, res)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
