// client/src/features/Game/components/Player.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/gameStore'; // Adjust path
import * as THREE from 'three';

// Reverted to simple Cone geometry
const playerGeometry = new THREE.ConeGeometry(0.7, 1.5, 8);
const playerMaterial = new THREE.MeshStandardMaterial({ color: "royalblue" }); // Use Standard for lighting

export default function Player() {
    const meshRef = useRef();
    const playerPosition = useGameStore((state) => state.playerPosition);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.position.lerp(playerPosition, 0.2); // Smooth interpolation
        }
    });

    return (
        // Rotate Cone to point "forward" (up/down Z axis) in Ortho view
        <mesh ref={meshRef} position={playerPosition} rotation={[Math.PI / 2, 0, 0]}>
            {/* Using primitive is slightly more performant for shared geometry/material */}
            <primitive object={playerGeometry} attach="geometry" />
            <primitive object={playerMaterial} attach="material" />
        </mesh>
    );
}