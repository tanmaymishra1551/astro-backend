
import { Server } from "socket.io"
let callIO
export function initCallSocket(server) {
    callIO = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    })
    // Hey, I want to handle events for clients connected to /call namespace.
    const callNamespace = callIO.of("/call")
    callNamespace.on("connection", (socket) => {
        console.log("🟣 User connected to /call:", socket.id)
        socket.on("join-room", (roomId) => {
            socket.join(roomId)
            socket.to(roomId).emit("user-joined", socket.id)
            console.log(`${socket.id} joined room: ${roomId}`)
        })

        socket.on("offer", ({ offer, to }) => {
            socket.to(to).emit("offer", { offer, from: socket.id });
        });
        
        socket.on("answer", ({ answer, to }) => {
            socket.to(to).emit("answer", { answer, from: socket.id });
        });
        
        socket.on("ice-candidate", ({ candidate, to }) => {
            socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
        });
        socket.on("disconnect", () => {
            console.log("🟣 User disconnected from /call:", socket.id)
        })
        // Call-related events here
    })
}
