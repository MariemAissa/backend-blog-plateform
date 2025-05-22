const express = require('express');
const http = require('http');
const { createClient } = require('redis');
const { Server } = require('socket.io');

require('dotenv').config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const PORT = process.env.PORT || 4000;

const redisSub = createClient({ url: REDIS_URL });


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' } // Update for production!
});

// Redis subscriber
//const redisSub = createClient();
redisSub.connect();

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Optional: join room by user ID (e.g., for private notifications)
    socket.on('join', (userId) => {
        console.log(`User ${userId} joined`);
        socket.join(userId); // socket.io "rooms"
    });
});

// Listen for Redis events
redisSub.subscribe('comment:created', (message) => {
    const data = JSON.parse(message);
    console.log('📩 Redis Event received:', data);

    // Emit to the specific user (article author)
    io.to(data.authorId.toString()).emit('notification', {
        type: 'comment',
        message: `New comment from user ${data.commenterId}`,
        content: data.commentContent,
    });
});

server.listen(4000, () => {
    console.log('🔔 NotificationService running on port 4000');
});
