import ChatMessage from "../../modules/chat/models/ChatMessage.js"
import { sendOfflineNotification } from "./services/notificationService.js"
// Chat Handlers
export const registerChatHandlers = (socket, io, connectedUsers) => {
    const { id: userId, username, role } = socket.user

    // Filters online astrologers, and emits their id and username back to the client.
    socket.on("getOnlineAstrologers", () => {
        // console.log(`getOnlineAstrologer event is triggered`)
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
    // ---------------------END------------------------------------------

    // Updates the astrologer's online status, then broadcasts it to all clients.
    socket.on("toggle-online-visibility", ({ id, showOnline }) => {
        // console.log(`User ${id} changed online visibility to ${showOnline}`)
        // console.log(
        //     `Connected User showOnline status: ${connectedUsers[id]?.showOnline}`
        // )
        if (connectedUsers[id] && connectedUsers[id].role === "astrologer") {
            connectedUsers[id].showOnline = showOnline
            io.emit("astrologer-status-update", {
                id,
                username: connectedUsers[id].username,
                status: showOnline ? "online" : "offline",
            })
        }
    })
    // --------------------END---------------------------------

    // Astrologer Dashboard Connection
    socket.on("joinAstrologer", ({ astrologerId, isAstrologer }) => {
        // console.log(`joinAstrologer event is triggered`)
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

    // Add the user's socket to the specified room for communication.
    socket.on("join-room", ({ roomId, recipientId, loggedInUserName }) => {
        // console.log(`User ${loggedInUserName} with socket id is ${socket.id} joined room ${roomId}`)
        // console.log(`User ${loggedInUserName} want to connect to ${recipientId}`)
        socket.join(roomId)
    })
    //---------------------END----------------------------------

    socket.on("markAsRead", async ({ messageId }) => {
        // console.log(`Message id sent from frontend is ${messageId}`)

        try {
            const updatedMessage = await ChatMessage.findByIdAndUpdate(
                messageId,
                { read: true },
                { new: true }
            )

            if (!updatedMessage) {
                console.log("Message not found")
                return
            }

            console.log("Updated message:", updatedMessage)
        } catch (err) {
            console.error("Error updating message:", err)
        }
    })

    // Listens for "sendMessage" event.
    // Saves the message in the database.
    // Checks if the receiver is online.
    // Sends real-time notification if the receiver is online, or offline notification if not.
    // Broadcasts the message to the room.
    socket.on(
        "sendMessage",
        async ({
            roomId,
            message,
            senderID,
            loggedInFullname,
            receiverID,
            timestamp,
        }) => {
            // Message will be saved in DB
            try {
                const newMessage = await ChatMessage.create({
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
                const messageId = newMessage._id
                const recipient = connectedUsers[receiverID] // Check if the receiver (astrologer) is online
                const messageData = {
                    message,
                    senderID,
                    loggedInFullname,
                    receiverID,
                    timestamp,
                }
                if (recipient) {
                    // ✅ Mark the message as read immediately if recipient is online
                    await ChatMessage.findByIdAndUpdate(messageId, {
                        read: true,
                    })
                    // console.log(`Astrologer ${receiverID} is online`)
                    // ✅ Send real-time notification to astrologer if online
                    recipient.socket.emit("newMessage", {
                        from: loggedInFullname,
                        message,
                        timestamp,
                    })
                } else {
                    sendOfflineNotification(receiverID, senderID, message)
                }
                console.log(
                    `Broadcasting data is ${JSON.stringify(messageData)}`
                )
                io.to(roomId).emit("receiveMessage", messageData)
            } catch (error) {
                console.error("Error storing message:", error)
            }
        }
    )
}
