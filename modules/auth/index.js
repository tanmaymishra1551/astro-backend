import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import ChatMessage from "../../modules/chat/models/ChatMessage.js"
import { sendOfflineNotification } from "./services/notificationService.js"

export const connectedUsers = {} // userId -> { socket, username }

export const initChatSocket = (server) => {
    const io = new Server(server, {
        path: "/ws/auth",
        cors: { origin: "*", methods: ["GET", "POST"] },
    })

    // Middleware for authentication
    io.use((socket, next) => {
        //SERVER except to have JWT access token from client
        const token =
            socket.handshake.auth?.loggedInToken ||
            socket.handshake.headers?.authorization?.split(" ")[1]
        // IF we have JWT access token in token variable ?
        if (!token)
            return next(new Error("Authentication error: Token missing"))
        // We have extract user details from JWT access token and pass details(socket.user) to next function
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            socket.user = decoded // Attach user data
            next()
        } catch {
            return next(new Error("Authentication error: Invalid token"))
        }
    })

    io.on("connection", (socket) => {
        if (!socket.user) {
            console.error("Unauthorized connection attempt")
            socket.disconnect()
            return
        }
        // console.log(`User connected: ${JSON.stringify(socket.user)}`)
        // {"id":1,"username":"rahul90","role":"user","iat":1743137646,"exp":1743138546}
        const { id: userId, username, role, showOnline } = socket.user
        connectedUsers[userId] = {
            socket,
            username,
            role,
            showOnline: role === "astrologer" ? true : undefined,
        }

        console.log("Connected Users:",Object.entries(connectedUsers).map(([id, { username }]) => ({
                id,
                username,
            }))
        )
        //Connected Users: [ { id: '10', username: 'rohan21' } ]

        // Handle Disconnection
        socket.on("disconnect", () => {
            // console.log(`User disconnected: ${socket.id} (${username})`)

            if (connectedUsers[userId]) {
                delete connectedUsers[userId]
                // console.log(`Removed ${username} (${userId}) from active connections.`)
                io.emit("astrologerOffline", { astrologerId: userId })
            }
        })
    })

    return io
}
