// client/src/hooks/useInputControls.js
import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore'; // Adjust path if needed

// Map key codes to game actions
const keyMap = {
    ArrowLeft: 'left',
    KeyA: 'left',       // WASD Support
    ArrowRight: 'right',
    KeyD: 'right',      // WASD Support
    Space: 'shoot',
    // Add other keys if needed
};

export const useInputControls = () => {
    // Get the action to update input state from the store
    const setPlayerInput = useGameStore((state) => state.setPlayerInput);

    // Handler for key down events
    const handleKeyDown = useCallback((event) => {
        const action = keyMap[event.code]; // Find corresponding action
        if (action) {
            // Prevent default browser behavior for keys like Space (scrolling)
            if(event.code === 'Space') {
                event.preventDefault();
            }
            // Update the store state for this action to true
            setPlayerInput({ [action]: true });
        }
    }, [setPlayerInput]); // Dependency: setPlayerInput action

    // Handler for key up events
    const handleKeyUp = useCallback((event) => {
        const action = keyMap[event.code]; // Find corresponding action
        if (action) {
            // Update the store state for this action to false
            setPlayerInput({ [action]: false });
        }
    }, [setPlayerInput]); // Dependency: setPlayerInput action

    // Effect to add/remove event listeners
    useEffect(() => {
        // Add listeners when the component using the hook mounts
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Cleanup function: remove listeners when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            // Optionally reset input state on unmount/cleanup if desired
            // useGameStore.getState().setPlayerInput({ left: false, right: false, shoot: false });
        };
    }, [handleKeyDown, handleKeyUp]); // Re-run effect if handlers change
};