import pool from "../../../config/db/mysql.db.js"

export async function getAvailableTimeSlots(astrologerId, date) {
    const query = `
        SELECT id, slot_date, start_time, end_time
        FROM time_slots
        WHERE astrologer_id = $1
        AND slot_date = $2
        AND status = 'available'
        ORDER BY start_time;
    `

    try {
        const { rows } = await pool.query(query, [astrologerId, date])
        // console.log(rows);
        return rows
    } catch (error) {
        throw new Error(`Error fetching time slots: ${error.message}`)
    }
}

export async function createBooking(booking_id,user_id,astrologer_id,time_slot) {
    const query = `
    INSERT INTO bookings (booking_id, user_id, astrologer_id, time_slot, status)
    VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `
    const values = [booking_id, user_id, astrologer_id, time_slot, 'pending'];
    try {
        const { rows } = await pool.query(query, values)
        console.log(rows)
        return rows[0]
    } catch (error) {
        throw new Error(`Error creating booking: ${error.message}`)
    }
}
