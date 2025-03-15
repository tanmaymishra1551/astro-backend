// modules/user-management/models/userQueries.js
import pool from "../../../config/db/mysql.db.js";


export const getAllUsers = async () => {
    const result = await pool.query("SELECT id, fullname, email,role,status FROM users")
    return result.rows
}

export const getUserById = async (id) => {
    const result = await pool.query(
        "SELECT id, fullname, email, phone, role, status, created_at, updated_at FROM users WHERE id = $1",
        [id]
    )
    return result.rows[0]
}

export const createUser = async ({
    fullname,
    email,
    username,
    phone,
    password,
    role,
}) => {
    const result = await pool.query(
        "INSERT INTO users (fullname, email,username, phone, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [fullname, email,username, phone, password, role]
    )
    return result.rows[0]
}

export const updateUser = async (id, data) => {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setQuery = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ")
    const query = `UPDATE users SET ${setQuery}, updated_at = NOW() WHERE id = $${
        keys.length + 1
    } RETURNING *`
    const result = await pool.query(query, [...values, id])
    return result.rows[0]
}

export const deleteUser = async (id) => {
    // Soft delete: update status to 'inactive'
    const result = await pool.query(
        "UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *",
        [id]
    )
    return result.rows[0]
}

export const updateUserStatus = async (id, status) => {
    const result = await pool.query(
        "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [status, id]
    )
    return result.rows[0]
}

export const changeUserRole = async (id, role) => {
    const result = await pool.query(
        "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [role, id]
    )
    return result.rows[0]
}
