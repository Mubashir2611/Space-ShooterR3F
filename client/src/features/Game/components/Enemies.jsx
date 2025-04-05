// client/src/features/Game/components/Enemies.jsx
import React, { useRef } from 'react';
import { useGameStore } from '../../../store/gameStore'; // Adjust path
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Reverted to simple Icosahedron geometry/material for enemies
const enemyGeometry = new THREE.IcosahedronGeometry(0.8, 0);
const enemyMaterial = new THREE.MeshStandardMaterial({ color: 'darkred' });

// Optional Spinning component for visual flair
function SpinningEnemy({ position }) {
    const meshRef = useRef();
     useFrame((state, delta) => {
         if(meshRef.current) {
            meshRef.current.rotation.y += delta * 1.0; // Adjust spin speed
            meshRef.current.rotation.x += delta * 0.3;
         }
     });
     return (
         <mesh
             ref={meshRef}
             position={position}
             geometry={enemyGeometry}
             material={enemyMaterial}
         />
     )
}

export default function Enemies() {
    const enemies = useGameStore((state) => state.enemies);

    return (
        <group>
            {enemies.map((enemyData) => (
                 // Render spinning enemy (or replace with simple mesh if preferred)
                 <SpinningEnemy key={enemyData.id} position={enemyData.position} />
            ))}
        </group>
    );
}