import { v2 as cloudinary } from "cloudinary";
import ChatMessage from "../models/ChatMessage.js";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Save Chat Message
export const saveMessage = async (data) => {
    try {
        await new ChatMessage(data).save();
    } catch (error) {
        console.error("Error saving message:", error);
    }
};

// Upload File to Cloudinary
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const result = await cloudinary.uploader.upload(req.file.path);
        return res.status(200).json({ fileUrl: result.secure_url });
    } catch (error) {
        return res.status(500).json({ error: "File upload failed" });
    }
};
