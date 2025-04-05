// client/src/components/UI/GameOverScreen.jsx
import React, { useState, useEffect } from 'react';
import { useGameStore, GameStates } from '../../store/gameStore'; 
import LeaderboardDisplay from '../Leaderboard/LeaderboardDisplay'; 

function GameOverScreen() {
    // --- Get State and Actions from Zustand Store ---
    const score = useGameStore((state) => state.score);
    const gameState = useGameStore((state) => state.gameState);
    const setGameState = useGameStore((state) => state.setGameState);
    const submitScore = useGameStore((state) => state.submitScore);
    const requestLeaderboard = useGameStore((state) => state.requestLeaderboard);
    const lastSubmissionError = useGameStore((state) => state.lastSubmissionError);
    const isConnected = useGameStore((state) => state.isConnected); // Check connection status

    // --- Local State for Email Input ---
    const [email, setEmail] = useState('');

    // --- Event Handlers ---
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        if (!email.trim()) { alert("Please enter an email address."); return; }
        if (!isConnected) { alert("Cannot submit score: Not connected to the server."); return; }
        submitScore(email); // Call store action
    };

    const handleRestart = () => {
        setGameState(GameStates.MENU); // Go back to main menu
    };

    // --- Effects ---
    // Fetch leaderboard when relevant
    useEffect(() => {
        if ( isConnected && (gameState === GameStates.GAME_OVER || gameState === GameStates.SUBMITTED)) {
            requestLeaderboard();
        }
    }, [gameState, isConnected, requestLeaderboard]);


    // --- Render Logic ---
    return (
        // Positioned by .game-over-screen CSS class
        <div className="game-over-screen">

            <h1>GAME OVER</h1>
            <h2>Final Score: {score}</h2>

            {/* Submission Form Area */}
            {gameState === GameStates.GAME_OVER && (
                <form onSubmit={handleSubmit} className="submission-form">
                    <p>Submit your score:</p>
                    <div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleEmailChange}
                            disabled={!isConnected}
                            required
                        />
                        <button type="submit" disabled={!isConnected || !email.trim()}>
                            Submit Score
                        </button>
                    </div>
                    {lastSubmissionError && <p className="error-message">{lastSubmissionError}</p>}
                    {!isConnected && <p className="error-message">Connect to server to submit score.</p>}
                </form>
            )}

            {/* Submission Status Messages */}
            {gameState === GameStates.SUBMITTING && (<p className="submission-status">Submitting score...</p>)}
            {gameState === GameStates.SUBMITTED && (<p className="success-message submission-status">Score submitted successfully!</p>)}

            {/* Leaderboard Display */}
            <LeaderboardDisplay />

            {/* Restart Button */}
            {(gameState === GameStates.GAME_OVER || gameState === GameStates.SUBMITTED) && (
                <button onClick={handleRestart} className="restart-button">
                    Back to Menu
                </button>
            )}

        </div> // End of .game-over-screen div
    );
}

export default GameOverScreen;