// client/src/features/Game/components/GameRunner.jsx
import useGameLoop from '../hooks/useGameLoop'; // Adjust path if needed

// This component's sole purpose is to call the game loop hook
// within the rendering context provided by <Canvas>.
function GameRunner() {
  useGameLoop(); // Activate the game loop logic
  return null; // It doesn't render anything visually itself
}

export default GameRunner;