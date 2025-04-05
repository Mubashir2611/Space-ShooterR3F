// client/src/features/Game/components/EnemyShip.jsx
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';

// --- Define Geometry/Materials outside component ---

// Enemy Body Shape (Inverted Triangle)
const enemyShape = new THREE.Shape();
const enemyWidth = 1.0;  // Adjust size as needed
const enemyHeight = 1.0;
// Centered origin approx
enemyShape.moveTo(0, -enemyHeight * 0.6);             // Bottom point
enemyShape.lineTo(-enemyWidth / 2, enemyHeight * 0.4); // Top left
enemyShape.lineTo(enemyWidth / 2, enemyHeight * 0.4);  // Top right
enemyShape.closePath();
const enemyGeometry = new THREE.ShapeGeometry(enemyShape);

// Engine Glow Shape (Small Sphere)
const engineRadius = 0.2;
const engineGeometry = new THREE.SphereGeometry(engineRadius, 8, 8);
const engineMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // Red

// Cache materials based on color to avoid recreating them every render
const enemyMaterialCache = {};
const getEnemyMaterial = (color) => {
  if (!enemyMaterialCache[color]) {
    enemyMaterialCache[color] = new THREE.MeshBasicMaterial({ color });
  }
  return enemyMaterialCache[color];
};


export default function EnemyShip({ position, color }) {
    // Use groupRef if you need to manipulate the group later (e.g., rotation)
    // const groupRef = useRef();

    // Get the cached material for this enemy's color
    const enemyMaterial = useMemo(() => getEnemyMaterial(color), [color]);

    // The position is taken directly from the props passed by Enemies.jsx
    // No useFrame needed here unless adding animations like spinning

    return (
        // Group allows positioning body and engine together
        // Position the group according to the data from the store
        <group position={position}>
            {/* Enemy Body Mesh */}
            <mesh
                geometry={enemyGeometry}
                material={enemyMaterial} // Use the color-specific material
            />
            {/* Engine Glow Mesh */}
            <mesh
                geometry={engineGeometry}
                material={engineMaterial}
                // Position engine relative to the group's origin (enemy center)
                position={[0, -enemyHeight * 0.5, 0.1]} // Below the body, slightly in front
             />
        </group>
    );
}