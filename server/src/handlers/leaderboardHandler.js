import supabase from '../services/supabaseClient.js';

// --- Main Handler Function (registers listeners for a specific socket) ---
const leaderboardHandler = (io, socket) => {

    /**
     * Handles 'submit_score' event from a client.
     * Validates payload, inserts into Supabase, and sends response.
     * @param {object} payload - Expected { email: string, score: number }
     */
    const handleSubmitScore = async (payload) => {
        console.log(`[Socket ${socket.id}] Received 'submit_score':`, payload);
        // Basic payload validation
        if (!payload || typeof payload.email !== 'string' || typeof payload.score !== 'number' || payload.score < 0) {
            console.error(`[Socket ${socket.id}] Invalid score submission data:`, payload);
            // Send error response back to the specific client
            socket.emit('score_submission_response', { success: false, error: 'Invalid data provided.' });
            return;
        }

        const { email, score } = payload;

        try {
            // Attempt to insert the score into the Supabase 'leaderboard' table
            const { data, error } = await supabase
                .from('leaderboard') // Make sure your table name is 'leaderboard'
                .insert([{ player_email: email, score: score }])
                .select(); // Optionally select the inserted data back if needed

            // Handle Supabase errors
            if (error) {
                console.error(`[Socket ${socket.id}] Supabase insert error:`, error.message);
                socket.emit('score_submission_response', { success: false, error: `Database error: ${error.message}` });
            } else {
                // Success!
                console.log(`[Socket ${socket.id}] Score submitted successfully for ${email}:`, data);
                socket.emit('score_submission_response', { success: true });

                // Optional: After successful submission, broadcast the updated leaderboard to ALL clients
                // This makes leaderboards update live for everyone when someone submits.
                fetchAndBroadcastLeaderboard(io);
            }
        } catch (err) {
            // Handle unexpected server errors during the process
            console.error(`[Socket ${socket.id}] Server error during score submission:`, err);
            socket.emit('score_submission_response', { success: false, error: 'An unexpected server error occurred.' });
        }
    };

    /**
     * Handles 'request_leaderboard' event from a client.
     * Fetches leaderboard data and sends it back to the requesting client.
     */
    const handleRequestLeaderboard = async () => {
         console.log(`[Socket ${socket.id}] Received 'request_leaderboard'`);
         // Fetch data and emit it specifically to the socket that requested it
         await fetchAndEmitLeaderboard(socket);
    };

    // --- Register event listeners for this socket connection ---
    socket.on('submit_score', handleSubmitScore);
    socket.on('request_leaderboard', handleRequestLeaderboard);

    // Note: Cleanup (socket.off) is usually handled implicitly when socket disconnects,
    // or can be managed in the main connection handler if needed.
};


// --- Helper Functions (Exported for potential use elsewhere, e.g., on connect) ---

/**
 * Fetches the top 10 leaderboard entries from Supabase.
 * @returns {Promise<Array|null>} - Array of leaderboard entries or null on error.
 */
export const fetchLeaderboardData = async () => {
    console.log("Attempting to fetch leaderboard data from Supabase...");
    try {
        // Fetch specified columns, order by score descending, limit to top 10
        const { data, error } = await supabase
            .from('leaderboard')
            .select('player_email, score, created_at') // Ensure these columns exist
            .order('score', { ascending: false })
            .limit(10);

        // Handle Supabase query errors
        if (error) {
            console.error('Supabase select error fetching leaderboard:', error.message);
            return null; // Indicate failure
        }
        console.log("Supabase fetch successful.");
        return data || []; // Return fetched data or an empty array if null/undefined
    } catch (err) {
        // Handle unexpected server errors during fetch
        console.error('Server error fetching leaderboard:', err);
        return null; // Indicate failure
    }
};

/**
 * Fetches leaderboard data and emits it to a specific socket.
 * @param {Socket} socket - The socket instance to emit to.
 */
const fetchAndEmitLeaderboard = async (socket) => {
    const leaderboardData = await fetchLeaderboardData();
    console.log(`Emitting 'leaderboard_update' to [Socket ${socket.id}]`);
    // Emit the data (or an empty array if fetch failed)
    socket.emit('leaderboard_update', leaderboardData || []);
};

/**
 * Fetches leaderboard data and broadcasts it to all connected sockets.
 * @param {Server} io - The Socket.IO server instance.
 */
export const fetchAndBroadcastLeaderboard = async (io) => {
    const leaderboardData = await fetchLeaderboardData();
    console.log("Broadcasting 'leaderboard_update' to all clients");
    // Emit the data (or an empty array if fetch failed) to everyone
    io.emit('leaderboard_update', leaderboardData || []);
};

// Export the main handler function
export default leaderboardHandler;