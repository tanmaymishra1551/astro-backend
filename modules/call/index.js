
export const registerCallHandlers = (socket, connectedUsers) => {
    socket.on("join-room", ({ roomId, recipientId, loggedInUserName }) => {
        console.log(
            `User ${loggedInUserName} with socket id is ${socket.id} joined room ${roomId}`
        )
        console.log(
            `User ${loggedInUserName} want to connect to ${recipientId}`
        )
        socket.join(roomId)
    })
    //Video Call Request
    socket.on("video-call-request", ({ roomId, from, to, username }) => {
        console.log(
            `Video call request from ${username} with socket id ${from} to ${to} in room ${roomId}`
        )
        const recipient = connectedUsers[to]
        if (recipient) {
            // console.log(`Recipient socket ID: ${recipient.socket.id} and roomId: ${roomId} and from is ${from}`)
            socket
                .to(recipient.socket.id)
                .emit("video-call-request", { roomId, from, username })
            console.log(`🔔 Video call request from ${from} to ${to}`)
        } else {
            console.log(`❌ Recipient ${to} not online`)
        }
    })
    socket.on(
        "offer",
        ({ offer, iceCandidates, roomId, callerId, calleeId }) => {
            const offerObj = JSON.stringify(offer.sdp)
            console.log(`Offer from offerObj to ${callerId}`)
            console.log(`type of iceCandidates is ${typeof iceCandidates}`)
            socket
                .to(callerId)
                .emit("offer", {
                    offer,
                    iceCandidates,
                    roomId,
                    calleeId: socket.id,
                })
        }
    )
    socket.on("answer", ({ answer, iceCandidates, to }) => {
        console.log(`Answer from caller ${answer} from ${to}`)
        socket.to(to).emit("answer", { answer, iceCandidates, from: socket.id })
    })
    socket.on("ice-candidate", ({ candidate, to }) => {
        // console.log(`ICE candidate from ${candidate} to ${to}`)
        socket.to(to).emit("ice-candidate", { candidate, from: socket.id })
    })
}
