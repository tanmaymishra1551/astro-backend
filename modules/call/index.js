import { Server } from "socket.io"
import { connectedUsers } from "../chat/index.js"

let callIO
console.log (`connectedUsers: ${JSON.stringify(connectedUsers)}`)
export function initCallSocket(server) {
    callIO = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    })
    const callNamespace = callIO.of("/call")

    callNamespace.on("connection", (socket) => {
        console.log("🟣 User connected to /call:", socket.id)

        socket.on("join-room", ({ roomId, recipientId }) => {
            console.log(`Room id and recipientId: ${roomId} and ${recipientId}`)
            socket.join(roomId)
            if (connectedUsers[recipientId]) {
                const recipientSocket = connectedUsers[recipientId].socket
                console.log(`Recipient socket ID: ${recipientSocket.id}`)
                // Use socket.to(recipientSocketId) or broadcast to that socket’s room
                socket.to(roomId).emit("user-joined", recipientSocket.id)
                console.log(`${socket.id} joined room: ${roomId}`)
            }
            else{
                console.log(`User with ID ${recipientId} is not connected`)
            }
        })

        socket.on("video-call-request", ({ roomId, from, to }) => {
            console.log(`Video call request from ${from} to ${to}`)
            const recipient = connectedUsers[to];
            if (recipient) {
                socket.to(recipient.socket.id).emit("video-call-request", { roomId, from });
                console.log(`🔔 Video call request from ${from} to ${to}`);
            } else {
                console.log(`❌ Recipient ${to} not online`);
            }
        });

        socket.on("offer", ({ offer, to }) => {
            const offerObj = JSON.stringify(offer.sdp)
            console.log(`Offer from ${offerObj} to ${to}`)
            socket.to(to).emit("offer", { offer, from: socket.id })
        })

        socket.on("answer", ({ answer, to }) => {
            socket.to(to).emit("answer", { answer, from: socket.id })
        })

        socket.on("ice-candidate", ({ candidate, to }) => {
            console.log(`ICE candidate from ${candidate} to ${to}`)
            socket.to(to).emit("ice-candidate", { candidate, from: socket.id })
        })

        socket.on("disconnect", () => {
            console.log("🟣 User disconnected from /call:", socket.id)
        })
    })
}
