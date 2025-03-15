// modules/user-management/models/astrologerModel.js
import pool from "../../../config/db/mysql.db.js";

export const getAstrologerDetailsByUserId = async (userId) => {
    const result = await pool.query(
        "SELECT * FROM astrologer_details WHERE astrologer_id = $1",
        [userId]
    )
    return result.rows[0]
}

export const createAstrologerDetails = async (details) => {
    const {
        astrologer_id,
        specialization,
        experience,
        availability,
        pricing,
        verification_status,
        profile_picture,
    } = details
    const result = await pool.query(
        `INSERT INTO astrologer_details (astrologer_id, specialization, experience, availability, pricing, verification_status, profile_picture)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
            astrologer_id,
            specialization,
            experience,
            availability,
            pricing,
            verification_status,
            profile_picture,
        ]
    )
    return result.rows[0]
}

export const updateAstrologerDetails = async (astrologer_id, details) => {
    const keys = Object.keys(details)
    const values = Object.values(details)
    const setQuery = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ")
    const query = `UPDATE astrologer_details SET ${setQuery}, updated_at = NOW() WHERE astrologer_id = $${
        keys.length + 1
    } RETURNING *`
    const result = await pool.query(query, [...values, astrologer_id])
    return result.rows[0]
}
