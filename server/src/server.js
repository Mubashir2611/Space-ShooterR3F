// server/src/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import onConnection from './handlers/connectionHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"; // Fallback
console.log("Allowing CORS for:", clientUrl);

const io = new Server(server, {
    cors: {
        origin: clientUrl, 
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.send('Space Shooter Server is running!');
});

io.on('connection', (socket) => {
    onConnection(io, socket); 
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on *:${PORT}`);
});