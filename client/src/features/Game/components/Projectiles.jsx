// client/src/features/Game/components/Projectiles.jsx
import React from 'react';
import { useGameStore } from '../../../store/gameStore'; // Adjust path
import * as THREE from 'three';

// Reverted to simple Sphere geometry/material
const projectileGeometry = new THREE.SphereGeometry(0.2, 8, 8);
const projectileMaterial = new THREE.MeshStandardMaterial({ color: 'yellow', emissive: 'yellow', emissiveIntensity: 1 });

export default function Projectiles() {
    const projectiles = useGameStore((state) => state.projectiles);

    return (
        <group>
            {projectiles.map((p) => (
                <mesh
                    key={p.id}
                    position={p.position}
                    geometry={projectileGeometry}
                    material={projectileMaterial}
                />
            ))}
        </group>
    );
}