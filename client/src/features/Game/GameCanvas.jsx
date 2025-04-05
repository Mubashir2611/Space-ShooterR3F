// client/src/features/Game/GameCanvas.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei'; // Ensure Orthographic is used

import Player from './components/Player'; // Will render reverted Player
import Enemies from './components/Enemies'; // Will render reverted Enemies
import Projectiles from './components/Projectiles'; // Will render reverted Projectiles
import Environment from './components/Environment';
import GameRunner from './components/GameRunner'; // Correctly runs useGameLoop

// Define camera properties (TUNE THIS ZOOM VALUE!)
const CAMERA_ZOOM = 40; // Adjust this to change the view scale

function GameCanvas() {
    return (
        // Canvas fills container via CSS
        <Canvas>
             <OrthographicCamera
                makeDefault // Use this camera
                position={[0, 0, 50]} // Z position is fine
                zoom={CAMERA_ZOOM} // Set zoom level
                near={0.1}
                far={100}
             />
             <GameRunner /> {/* Calls useGameLoop */}
             <ambientLight intensity={1.0} /> {/* Simple lighting */}
             <Suspense fallback={null}>
                 <Environment />
                 <Player />
                 <Enemies />
                 <Projectiles />
             </Suspense>
        </Canvas>
    );
}
export default GameCanvas;