import { randomBytes } from 'crypto';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

interface Message {
    id: string;
    content: string;
    senderId: string;
    sender: string;
    timestamp: Date;
}

interface Room {
    users: Set<string>;
    messages: Message[];
    lastActive: number;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:4200"],
        methods: ["GET", "POST"]
    }
});

const rooms = new Map<string, Room>();

io.on('connection', (socket) => {
    console.log('User Connected', socket.id);

    socket.on('set-user-id', (userId: string) => {
    });

    //create room event
    socket.on('create-room', () => {
        const roomCode = randomBytes(3).toString('hex').toUpperCase();
        rooms.set(roomCode, {
            users: new Set<string>(),
            messages: [],
            lastActive: Date.now()
        });
        socket.emit('room-created', roomCode);
    });

    //join room event
    socket.on('join-room', (data) => {
        const paresedData = JSON.parse(data);
        const roomCode = paresedData.roomId;
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', 'Room not found');
            return;
        }

        socket.join(roomCode);
        room.users.add(socket.id);
        room.lastActive = Date.now();

        socket.emit('joined-room', {
            roomId: roomCode,
            messages: room.messages
        });

        io.to(roomCode).emit('user-joined', room.users.size);
    });

    //send message event
    socket.on('send-message', ({ roomCode, message, userId, name }) => {
        const room = rooms.get(roomCode);
        if (room) {
            room.lastActive = Date.now();
            const messageData: Message = {
                id: randomBytes(4).toString('hex'),
                content: message,
                senderId: userId,
                sender: name,
                timestamp: new Date()
            };

            room.messages.push(messageData);
            io.to(roomCode).emit('new-message', messageData);
        }
    });
    
    // disconnect event
    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
        rooms.forEach((room, roomCode) => {
            if (room.users.has(socket.id)) {
                room.users.delete(socket.id);
                io.to(roomCode).emit('user-left', room.users.size);

                if (room.users.size === 0) {
                    console.log(`Room ${roomCode} is empty, deleting...`);
                    rooms.delete(roomCode);
                }
            }
        });
    });
});

setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, roomCode) => {
        if (now - room.lastActive > 5 * 60 * 1000) { // 5 minutes
            console.log(`Room ${roomCode} is inactive, deleting...`);
            rooms.delete(roomCode);
        }
    });
},3600000); // Check every hour

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});