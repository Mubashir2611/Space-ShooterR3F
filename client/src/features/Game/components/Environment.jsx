// client/src/features/Game/components/Environment.jsx
import React from 'react';
import { Stars } from '@react-three/drei';

export default function Environment() {
    return (
        // Configure Stars for appearance - Adjust props as desired
        <Stars
            radius={300} // Size of star field sphere
            depth={80}   // Depth distribution factor
            count={5000} // Number of stars
            factor={5}   // Star size multiplier
            saturation={0} // Stars are white (no color)
            fade         // Stars fade near clipping plane
            speed={0.5}  // Speed of passive movement/twinkle effect
        />
        // Could add background planes or other elements here
    );
}