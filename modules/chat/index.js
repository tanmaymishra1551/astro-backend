import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ChatMessage from "../../modules/chat/models/ChatMessage.js";
import { sendOfflineNotification } from "./services/notificationService.js";

const connectedUsers = {}; // userId -> { socket, username }

export const initChatSocket = (server) => {
    const io = new Server(server, {
        path: "/ws/chat",
        cors: { origin: "*", methods: ["GET", "POST"] },
    });

    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
        if (!token) return next(new Error("Authentication error: Token missing"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // Attach user data
            next();
        } catch {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const { id: userId, username } = socket.user;
        connectedUsers[userId] = { socket, username };

        console.log(`User connected: ${socket.id}, Username: ${username}, User ID: ${userId}`);

        socket.on("joinAstrologer", ({ astrologerId, isAstrologer }) => {
            connectedUsers[astrologerId] = { socket, username };
            console.log(`Astrologer dashboard connected: ${astrologerId}`);

            if (isAstrologer) io.emit("astrologerOnline", { astrologerId });
        });

        socket.on("getUnreadMessages", async ({ astrologerId }) => {
            try {
                const unreadMessages = await ChatMessage.find({ receiverId: astrologerId, read: false });
                socket.emit("loadUnreadMessages", unreadMessages);
            } catch (error) {
                console.error("Error fetching unread messages:", error);
            }
        });

        socket.on("joinRoom", ({ roomId }) => {
            socket.join(roomId);
            console.log(`User ${username} (${socket.id}) joined room ${roomId}`);
        });

        socket.on("sendMessage", async ({ roomId, message, senderId, receiverId, timestamp }) => {
            try {
                await ChatMessage.create({ roomId, senderId, receiverId, message, timestamp });
                console.log("Message stored in database");
            } catch (error) {
                console.error("Error storing message:", error);
            }

            const recipient = connectedUsers[receiverId];

            if (recipient) {
                recipient.socket.emit("receiveMessage", { message, senderId, timestamp });
            } else {
                sendOfflineNotification(receiverId, senderId, message);
            }
            io.to(roomId).emit("receiveMessage", { message, senderId, timestamp });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}, Username: ${username}`);

            for (const userId in connectedUsers) {
                if (connectedUsers[userId].socket === socket) {
                    delete connectedUsers[userId];
                    console.log(`User ${username} (${userId}) removed from active connections.`);
                    io.emit("astrologerOffline", { astrologerId: userId });
                    break;
                }
            }
        });
    });

    return io;
};
