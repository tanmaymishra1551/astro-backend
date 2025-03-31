// Services contains postgreSQL queries to interact with the database. 

import pool from "../../../config/db/mysql.db.js";

export const createUser = async ({
    fullname,
    email,
    username,
    password,
    role,
    phone
}) => {
    const result = await pool.query(
        "INSERT INTO users (fullname,email,username, password, role,phone) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *",
        [fullname, email, username, password, role,phone]
    )

    let user = result.rows[0]
    delete user.password
    return user
}

export const getUserByUsernameOrEmail = async (username, email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE username = $1 OR email = $2",
        [username, email]
    )
    return result.rows[0] // Return the user if found, otherwise undefined
}

export const getUserByUsername = async (username) => {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
        username,
    ])
    return result.rows[0]
}

export const findOne = async (phone) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE phone = $1",
        [phone]
    )
    return result.rows[0]
}

export const findById = async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])
    return result.rows[0]
}

export const loggedInUserDetails = async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])
    let user = result.rows[0]
    delete user.password 
    delete user.refresh_token
    return result.rows[0]
}

export const updateRefreshToken = async (userId, refreshToken) => {
    const result = await pool.query(
        "UPDATE users SET refresh_token = $2 WHERE  id = $1 RETURNING *",
        [userId, refreshToken]
    )
    return result.rows[0]
}

export const getAllUsers = async () => {
    const result = await pool.query("SELECT id, fullname, email FROM users")
    return result.rows
}

export const getAllAstrologer = async () => {
    const result = await pool.query(
        "SELECT id, fullname, username, email, role, profile_image, phone, status FROM users WHERE role = 'astrologer'"
    )
    return result.rows
}
