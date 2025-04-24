import { Server } from "socket.io"
import { registerChatHandlers } from "../modules/chat/index.js";
import { registerCallHandlers } from "../modules/call/index.js";
import { socketAuthMiddleware } from "../middlewares/authMiddleware.js";
export const connectedUsers = {} // userId -> { socket, username }
export const initSocket = (server) => {
    const io = new Server(server, {
        path: "/ws/chat",
        cors: { origin: "*", methods: ["GET", "POST"] },
    });
    io.use(socketAuthMiddleware);
    io.on("connection", (socket) => {
        const { id: userId, username, role } = socket.user;
        connectedUsers[userId] = {
            socket,
            username,
            role,
            showOnline: role === "astrologer" ? true : undefined,
        };
        // Register separated handlers
        registerChatHandlers(socket, io, connectedUsers);
        registerCallHandlers(socket, connectedUsers);
        socket.on("disconnect", () => {
            delete connectedUsers[userId];
            io.emit("astrologerOffline", { astrologerId: userId });
        });
    });
    return io;
};
