const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (role) => {
        console.log(`User ${socket.id} joined as ${role}`);
        socket.join('screen-share-room');
        // Notify others in the room that a user joined
        socket.to('screen-share-room').emit('user-joined', role);
    });

    socket.on('offer', (offer) => {
        socket.to('screen-share-room').emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.to('screen-share-room').emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
        socket.to('screen-share-room').emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
