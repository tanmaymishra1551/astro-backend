import { Server } from "socket.io"
import ChatMessage from "../../modules/chat/models/ChatMessage.js"
import { sendOfflineNotification } from "./services/notificationService.js"

const connectedUsers = {} // userId -> socketInstance

export const initChatSocket = (server) => {
    const io = new Server(server, {
        path: "/ws/chat",
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    })

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`)

        // Register user or astrologerId
        socket.on("joinAstrologer", ({ astrologerId, isAstrologer }) => {
            connectedUsers[astrologerId] = socket
            console.log(`Astrologer dashboard connected: ${astrologerId}`)

            // If astrologer, notify clients
            if (isAstrologer) {
                console.log(
                    `isAstrologer ${isAstrologer} is online. Notifying clients.`
                )
                io.emit("astrologerOnline", { astrologerId: astrologerId })
            }
        })

        socket.on("getUnreadMessages", async ({ astrologerId }) => {
            try {
                // Query the database for unread messages for the astrologer
                const unreadMessages = await ChatMessage.find({
                    receiverId: astrologerId,
                    read: false,
                })
                console.log("Unread messages fetched:", unreadMessages)
                socket.emit("loadUnreadMessages", unreadMessages)
            } catch (error) {
                console.error("Error fetching unread messages:", error)
            }
        })

        // User joins a chat room
        socket.on("joinRoom", ({ roomId }) => {
            socket.join(roomId)
            console.log(`User ${socket.id} joined room ${roomId}`)
        })

        // Sending a message
        socket.on(
            "sendMessage",
            async ({ roomId, message, senderId, receiverId }) => {
                console.log(
                    `Message from ${senderId} to ${receiverId} in room ${roomId}: ${message}`
                )
                // STORE MESSAGE IN DATABASE
                try {
                    await ChatMessage.create({
                        roomId,
                        senderId,
                        receiverId,
                        message,
                    })
                    console.log("Message stored in database")
                } catch (error) {
                    console.error("Error storing message:", error)
                }

                // Check if receiver (Astrologer) is online
                const recipientSocket = connectedUsers[receiverId]

                if (recipientSocket) {
                    recipientSocket.emit("receiveMessage", {
                        message,
                        senderId,
                    })
                } else {
                    // Send offline notification
                    sendOfflineNotification(receiverId, senderId, message)
                }
                io.to(roomId).emit("receiveMessage", { message, senderId })
            }
        )

        // Handle user disconnect
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`)

            for (const [userId, sock] of Object.entries(connectedUsers)) {
                if (sock === socket) {
                    delete connectedUsers[userId]
                    console.log(
                        `User ${userId} removed from active connections.`
                    )

                    // If astrologer goes offline, notify clients
                    io.emit("astrologerOffline", { astrologerId: userId })
                    break
                }
            }
        })
    })

    return io
}


