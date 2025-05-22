const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) connectedUsers.set(userId, socket.id);

    console.log(`User connected: ${userId}`);

    socket.on("disconnect", () => {
        connectedUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
    });
});

// Listen for events from ArticleService (we'll simulate this via REST for now)
app.use(express.json());
app.post('/notify', (req, res) => {
    const { userId, message } = req.body;
    const socketId = connectedUsers.get(userId);
    if (socketId) {
        io.to(socketId).emit("notification", { message });
    }
    res.sendStatus(200);
});

server.listen(6000, () => console.log("NotificationService running on port 6000"));
