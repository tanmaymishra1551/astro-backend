import pool from "../config/db.js";

export const updateProfileImage = async (userId, imageUrl) => {
    const result = await pool.query(
        "UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING *",
        [imageUrl, userId]
    );
    return result.rows[0]; // Returns updated user data
};
