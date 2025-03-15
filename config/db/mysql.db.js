import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
});

pool.on("connect", () => {
    // console.log("Database connected successfully");
});

export default pool;
