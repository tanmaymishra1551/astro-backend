import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import ChatMessage from "../../modules/chat/models/ChatMessage.js"
import { sendOfflineNotification } from "./services/notificationService.js"

export const connectedUsers = {} // userId -> { socket, username }

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
        console.log(`Chat socket connection is established`)
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
        // socket.on("joinRoom", ({ roomId }) => {
        //     socket.join(roomId)
        //     // console.log(`${username} (${socket.id}) joined room ${roomId}`)
        //     // rahul90 (knGABIikQXpglRgHAAAC) joined room chat_2_1
        // })

        socket.on("join-room", ({ roomId, recipientId, loggedInUser }) => {
            // console.log(`Room id and recipientId: ${roomId} and ${recipientId}`)
            socket.join(roomId)
            if (connectedUsers[recipientId]) {
                const recipientSocket = connectedUsers[recipientId].socket
                // Use socket.to(recipientSocketId) or broadcast to that socket’s room
                socket.to(roomId).emit("user-joined", recipientSocket.id)
                // console.log(`${recipientSocket.id} joined room: ${roomId}`)
            } else {
                console.log(`User with ID ${recipientId} is not connected`)
            }
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

        //Video Call Request
        socket.on("video-call-request", ({ roomId, from, to }) => {
            // console.log(`Video call request from ${from} to ${to} in room ${roomId}`)
            const recipient = connectedUsers[to]
            if (recipient) {
                // console.log(`Recipient socket ID: ${recipient.socket.id} and roomId: ${roomId} and from is ${from}`)
                socket
                    .to(recipient.socket.id)
                    .emit("video-call-request", { roomId, from })
                console.log(`🔔 Video call request from ${from} to ${to}`);
            } else {
                console.log(`❌ Recipient ${to} not online`)
            }
        })

        socket.on("offer", ({ offer, to }) => {
            const offerObj = JSON.stringify(offer.sdp)
            // console.log(`Offer from ${offerObj} to ${to}`)
            socket.to(to).emit("offer", { offer, from: socket.id })
        })

        socket.on("answer", ({ answer, to }) => {
            socket.to(to).emit("answer", { answer, from: socket.id })
        })

        socket.on("ice-candidate", ({ candidate, to }) => {
            // console.log(`ICE candidate from ${candidate} to ${to}`)
            socket.to(to).emit("ice-candidate", { candidate, from: socket.id })
        })

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
