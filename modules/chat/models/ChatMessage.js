// modules/chat/models/ChatMessage.js
import mongoose from "mongoose"

const chatMessageSchema = new mongoose.Schema({
    fullname: String,
    roomId: String,
    senderId: String,
    receiverId: String,
    message: String,
    fileUrl: String,
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
})

export default mongoose.model("ChatMessage", chatMessageSchema)
