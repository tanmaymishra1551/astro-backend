// ------------------------------DEVELOPMENT-------------------------------------
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.LOCAL_POSTGRES_CONNECTION_STRING,
});

pool.on("connect", () => {
    // console.log("Database connected successfully");
});

export default pool;


// ------------------------------PRODUCTION-------------------------------------
// import pkg from "pg"

// const { Pool } = pkg

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASS,
//     port: process.env.DB_PORT || 5432,
//     ssl: { rejectUnauthorized: false },
// })

// pool.on("connect", () => {
//     // console.log("Database connected successfully");
// })

// export default pool;
