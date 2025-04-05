// server/src/handlers/connectionHandler.js
import leaderboardHandler, { fetchAndBroadcastLeaderboard } from './leaderboardHandler.js';

const onConnection = (io, socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register handlers for this specific socket
    leaderboardHandler(io, socket);
    // Add other handlers (e.g., game actions) here in the future

    // Optional: Send current leaderboard to newly connected client
    fetchAndBroadcastLeaderboard(io); // Or just fetchAndEmitLeaderboard(socket)


    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Handle cleanup if needed (e.g., remove player from game state)
    });
};

export default onConnection;