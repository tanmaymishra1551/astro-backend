import * as bookingService from "../services/timeSlotService.js";
import * as notificationService from "../services/notificationService.js";

// Get Available Time Slots
export const getAvailableTimeSlots = async (req, res) => {
    try {
        const { astrologer_id, slot_date } = req.body;
        const availableSlots = await bookingService.getAvailableTimeSlots(astrologer_id, slot_date);
        res.status(200).json({ availableSlots });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Booking
export const createBooking = async (req, res) => {
    try {
        const { booking_id, user_id, astrologer_id, time_slot } = req.body;
        const booking = await bookingService.createBooking(booking_id, user_id, astrologer_id, time_slot);

        // Notify user & astrologer
        await Promise.all([
            notificationService.notifyUser(user_id, `Your booking (ID: ${booking.booking_id}) for ${booking.time_slot} has been created.`),
            notificationService.notifyAstrologer(astrologer_id, `New booking (ID: ${booking.booking_id}) scheduled at ${booking.time_slot}.`)
        ]);

        res.status(201).json({ booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Booking Status
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const updatedBooking = await bookingService.updateBookingStatus(bookingId, req.body);
        res.status(200).json({ booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
