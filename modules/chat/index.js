import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import ChatMessage from "../../modules/chat/models/ChatMessage.js"
import { sendOfflineNotification } from "./services/notificationService.js"

const connectedUsers = {} // userId -> { socket, username }

export const initChatSocket = (server) => {
    const io = new Server(server, {
        path: "/ws/chat",
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

        // console.log(
        //     "Connected Users:",
        //     Object.entries(connectedUsers).map(([id, { username }]) => ({
        //         id,
        //         username,
        //     }))
        // )
        //Connected Users: [ { id: '10', username: 'rohan21' } ]

        // User Requests Online Astrologers
        socket.on("getOnlineAstrologers", () => {
            // console.log("Connected Users:")
            Object.entries(connectedUsers).forEach(([id, user]) => {
                // console.log(
                //     `ID: ${id}, Username: ${user.username}, Role: ${user.role}, ShowOnline: ${user.showOnline}`
                // )
            })

            const onlineAstrologers = Object.entries(connectedUsers)
                .filter(
                    ([_, user]) => user.role === "astrologer" && user.showOnline
                )
                .map(([id, user]) => ({ id, username: user.username }))

            // console.log("Filtered Online Astrologers:", onlineAstrologers)
            socket.emit("onlineAstrologersList", onlineAstrologers)
        })

        socket.on("toggle-online-visibility", ({ id, showOnline }) => {
            // console.log(`User ${id} changed online visibility to ${showOnline}`)
            // console.log(
            //     `Connected User showOnline status: ${connectedUsers[id]?.showOnline}`
            // )
            if (
                connectedUsers[id] &&
                connectedUsers[id].role === "astrologer"
            ) {
                connectedUsers[id].showOnline = showOnline
                io.emit("astrologer-status-update", {
                    id,
                    username: connectedUsers[id].username,
                    status: showOnline ? "online" : "offline",
                })
            }
        })

        // Astrologer Dashboard Connection
        socket.on("joinAstrologer", ({ astrologerId, isAstrologer }) => {
            // Merge existing info instead of overwriting
            const existing = connectedUsers[astrologerId] || {}
            connectedUsers[astrologerId] = {
                ...existing,
                socket,
                username: existing.username || username,
                role: existing.role || (isAstrologer ? "astrologer" : "user"),
                showOnline:
                    existing.showOnline ?? (isAstrologer ? true : undefined),
            }

            if (isAstrologer) io.emit("astrologerOnline", { astrologerId })
        })

        // Fetch Unread Messages
        socket.on("getUnreadMessages", async ({ astrologerId }) => {
            // console.log(`Astrologer id from astrologer dashboard is ${astrologerId}`)
            try {
                const unreadMessages = await ChatMessage.find({
                    receiverId: astrologerId,
                    read: false,
                })

                // console.log(`Unread messages for ${astrologerId}:`,unreadMessages.length)
                socket.emit("loadUnreadMessages", unreadMessages)
            } catch (error) {
                console.error("Error fetching unread messages:", error)
            }
        })

        // Join Chat Room
        socket.on("joinRoom", ({ roomId }) => {
            socket.join(roomId)
            // console.log(`${username} (${socket.id}) joined room ${roomId}`)
            // rahul90 (knGABIikQXpglRgHAAAC) joined room chat_2_1
        })

        // Handle Sending Messages
        socket.on(
            "sendMessage",
            async ({ roomId, message, senderID, receiverID, timestamp }) => {

                // Message will be saved in DB 
                try {
                    await ChatMessage.create({
                        roomId,
                        senderId: senderID,
                        receiverId: receiverID,
                        message,
                        timestamp,
                    })
                    // console.log(`Message stored in DB where
                    //     roomId is ${roomId}
                    //     message is ${message}
                    //     senderId is ${senderID}
                    //     receiverId is ${receiverID}
                    //     timestamp is ${timestamp}`)

                    const recipient = connectedUsers[receiverID] // Check if the receiver (astrologer) is online
                    const messageData = {
                        message,
                        senderID,
                        receiverID,
                        timestamp,
                    }

                    if (recipient) {
                        // console.log(`Astrologer ${receiverID} is online`)
                        // ✅ Send real-time notification to astrologer if online
                        recipient.socket.emit("newMessage", {
                            from: senderID,
                            message,
                            timestamp,
                        })
                    } else {
                        sendOfflineNotification(receiverID, senderID, message)
                    }
                    // console.log(`Broadcasting data is ${JSON.stringify(messageData)}`)
                    io.to(roomId).emit("receiveMessage", messageData)
                } catch (error) {
                    console.error("Error storing message:", error)
                }
            }
        )

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
