import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import http from "http"
import connectDB from "./config/db/mongo.db.js"
import cors from "cors";
dotenv.config()


// Create the Express application
const app = express()
app.use(cors());


app.use(bodyParser.json())
const server = http.createServer(app)
// Initialize WebSocket server for the Chat module
import { initChatSocket } from "./modules/chat/index.js"
initChatSocket(server)

// Import module routes
import authRoutes from "./modules/auth/routes/authRoutes.js"
import bookingRoutes from "./modules/booking/routes/bookingRoutes.js"
import chatRoutes from "./modules/chat/routes/chatRoutes.js"
import paymentRoutes from "./modules/payment/routes/paymentRoutes.js"
import dashboardRoutes from "./modules/dashboard/routes/dashboardRoutes.js"
import userManagementRoutes from "./modules/user-management/routes/userManagementRoutes.js"

// Mount routes (like an API Gateway)
app.use("/auth", authRoutes)
app.use("/booking", bookingRoutes)
app.use("/chat", chatRoutes)
app.use("/payment", paymentRoutes)
app.use("/dashboard", dashboardRoutes)
app.use("/admin/users", userManagementRoutes)
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 3000
connectDB()
    .then(
        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`)
        })
    )
    .catch((error) => {
        console.log(`Mongodb connection failed  ${error}`)
    })