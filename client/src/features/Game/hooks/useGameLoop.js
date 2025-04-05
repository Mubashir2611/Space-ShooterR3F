// client/src/features/Game/hooks/useGameLoop.js
import { useFrame } from '@react-three/fiber';
import { useGameStore, GameStates } from '../../../store/gameStore'; // Adjust path if needed

function useGameLoop() {
    // Get the main update action and current game state from the Zustand store
    const updateGameFrame = useGameStore((state) => state.updateGameFrame);
    const gameState = useGameStore((state) => state.gameState);

    // useFrame runs the callback function on every rendered frame
    useFrame((state, delta) => {
        // 'state' here is R3F's frame state (clock, camera, etc.)
        // 'delta' is the time difference (in seconds) since the last frame

        // Only run game logic if the game is actively playing
        if (gameState === GameStates.PLAYING) {
            // Call the update function from the store, passing timing info
            updateGameFrame(delta, state.clock.elapsedTime);
        }
    });
}

export default useGameLoop;