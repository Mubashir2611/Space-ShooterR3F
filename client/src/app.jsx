// client/src/App.jsx
import React, { useEffect } from 'react';
import { useGameStore, GameStates } from './store/gameStore'; // Adjust path
import GameCanvas from './features/Game/GameCanvas'; // Adjust path
import MainMenu from './components/UI/MainMenu'; // Adjust path
import GameOverScreen from './components/UI/GameOverScreen'; // Adjust path
import HUD from './components/UI/HUD'; // Adjust path
import { useInputControls } from './hooks/useInputControls'; // Adjust path
import './styles/index.css'; // Import base styles

function App() {
    // --- Get State & Actions ---
    const gameState = useGameStore((state) => state.gameState);
    const isConnected = useGameStore((state) => state.isConnected);
    const initializeWebSocketListeners = useGameStore((state) => state.initializeWebSocketListeners);
    const connectWebSocket = useGameStore((state) => state.connectWebSocket);
    const disconnectWebSocket = useGameStore((state) => state.disconnectWebSocket); // For cleanup

    // --- Setup Global Hooks ---
    useInputControls(); // Activate keyboard input listeners globally

    // --- Effects ---
    // Initialize WebSocket listeners once on component mount
    useEffect(() => {
        initializeWebSocketListeners();
        connectWebSocket(); // Attempt to connect when app loads

        // Optional: Cleanup WebSocket connection on app unmount
        return () => {
             disconnectWebSocket(); // Disconnect when App unmounts
        };
        // Added disconnectWebSocket to dependencies if you use it in cleanup
    }, [initializeWebSocketListeners, connectWebSocket, disconnectWebSocket]);


    // --- Render Logic based on Game State ---
    const renderGameState = () => {
        switch (gameState) {
            case GameStates.PLAYING:
                return (
                    <>
                        {/* HUD overlays the game canvas */}
                        <HUD />
                        {/* The 3D game scene */}
                        <GameCanvas />
                    </>
                );
            case GameStates.GAME_OVER:
            case GameStates.SUBMITTING:
            case GameStates.SUBMITTED:
                // Game Over screen handles these related states internally
                return <GameOverScreen />;
            case GameStates.MENU:
            default:
                // Main Menu screen
                return <MainMenu />;
        }
    };

    // --- Main App Structure ---
    return (
        // This container takes full screen via CSS (.app-container)
        <div className="app-container">
            {/* Connection Status Indicator */}
            {!isConnected && <div className="connection-status offline">Connecting to server...</div>}
            {isConnected && <div className="connection-status online">Connected</div>}

            {/* Render the appropriate view based on the game state */}
            {renderGameState()}
        </div>
    );
}

export default App;