// client/src/components/UI/HUD.jsx
import React from 'react';
import { useGameStore } from '../../store/gameStore'; // Adjust path

function HUD() {
    const score = useGameStore((state) => state.score);
    // Power level removed in this reverted version

    return (
        // Positioned top-left by CSS
        <div className="hud">
            <div className="score">Score: {score}</div>
        </div>
    );
}
export default HUD;