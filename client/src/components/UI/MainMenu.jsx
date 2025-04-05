import React from 'react';
import { useGameStore, GameStates } from '../../store/gameStore';

function MainMenu() {
    const setGameState = useGameStore((state) => state.setGameState);
    const resetScore = useGameStore((state) => state.resetScore);

    const startGame = () => {
        resetScore(); // Reset score when starting a new game
        setGameState(GameStates.PLAYING);
    };

    return (
        <div className="menu-screen">
            <h1>Space Shooter R3F</h1>
            <button onClick={startGame}>Start Game</button>
            {/* You could add a Leaderboard view button here too */}
        </div>
    );
}

export default MainMenu;