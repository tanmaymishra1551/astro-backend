import jwt from "jsonwebtoken"
export const socketAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth?.loggedInToken || socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) return next(new Error("Authentication error: Token missing"));
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.user = decoded;
        next();
    } catch {
        return next(new Error("Authentication error: Invalid token"));
    }
};
