// modules/payment/services/paymentService.js

// Simulated UPI API call (replace with actual integration if available)
async function fakeUpiApiCall(payload) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                paymentUrl: `https://generic-upi-gateway.com/pay?token=faketoken`,
                transactionId: `txn_${Date.now()}`,
            })
        }, 500)
    })
}

export const initiatePayment = async ({ bookingId, amount, upiId }) => {
    const paymentPayload = {
        bookingId,
        amount,
        upiId,
        callbackUrl: process.env.PAYMENT_CALLBACK_URL, // e.g., https://your-api-domain.com/payment/callback
    }

    const response = await fakeUpiApiCall(paymentPayload)
    return {
        paymentUrl: response.paymentUrl,
        transactionId: response.transactionId,
    }
}

export const handlePaymentCallback = async (req, res) => {
    const { transactionId, bookingId, status } = req.body
    if (status === "SUCCESS") {
        res.status(200).json({
            message: "Payment confirmed and booking updated",
        })
    } else {
        res.status(400).json({ error: "Payment failed or invalid" })
    }
}
