const { createClient } = require('redis');

const redisSub = createClient();

redisSub.connect();

redisSub.subscribe('comment:created', (message) => {
    const data = JSON.parse(message);
    console.log('📩 New comment event:', data);

    // Here: Send WebSocket or Push Notification
    // For example: notify article author
    notifyUser(data.authorId, {
        title: 'New Comment',
        body: `Your article got a new comment from user ${data.commenterId}: "${data.commentContent}"`,
    });
});

// Example notification function
function notifyUser(userId, notification) {
    // Send via socket.io or web-push here
    console.log(`Notifying user ${userId}:`, notification);
}
