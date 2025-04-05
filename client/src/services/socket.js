// client/src/services/socket.js
import { io } from 'socket.io-client';

// Use environment variable for URL, with correct fallback to backend port
const URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'; // Ensure this points to 3001!

console.log("Initializing WebSocket connection attempt to:", URL);

// Create socket instance
export const socket = io(URL, {
    autoConnect: false, // Connect manually via store action
    reconnectionAttempts: 5,
    reconnectionDelay: 2000, // Slightly longer delay
});

// --- Optional: Add logging for common events ---
socket.on("connect", () => {
    console.log("WebSocket connected via socket.js:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("WebSocket disconnected via socket.js:", reason);
});

 socket.on("connect_error", (err) => {
    // Log detailed connection error
    console.error(`WebSocket connection error via socket.js: ${err.message}`, err.data || '');
 });

// Functions to interact with socket can be added here if needed,
// but direct connect/disconnect are handled in the store for this setup.