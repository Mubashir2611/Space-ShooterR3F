// client/src/store/gameStore.js
import { create } from 'zustand';
import { socket } from '../services/socket'; // Adjust path if needed
import * as THREE from 'three';

// --- Game States ---
export const GameStates = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover',
    SUBMITTING: 'submitting',
    SUBMITTED: 'submitted',
};

// --- Game Constants (Adjust based on camera/testing) ---
// Using placeholder values - TUNE THESE
const PLAYER_SPEED = 10;
const PROJECTILE_SPEED = 15;
const ENEMY_BASE_SPEED = 2;
const ENEMY_SPAWN_RATE_INITIAL = 1.5; // seconds
const ENEMY_SPAWN_RATE_SCALE = 0.01;
const FIRE_RATE = 0.2; // seconds between shots

// Placeholder boundaries - TUNE BASED ON CAMERA ZOOM
const VIEW_HEIGHT = 20; // Example value
const VIEW_WIDTH = 20 * (window.innerWidth / window.innerHeight);
const PLAYER_BOUNDS_X = VIEW_WIDTH / 2 * 0.9;
const PLAYER_Y_POSITION = -VIEW_HEIGHT / 2 * 0.8;
const PROJECTILE_BOUNDS_Y = VIEW_HEIGHT / 2 * 1.1;
const ENEMY_BOUNDS_Y_DESPAWN = -VIEW_HEIGHT / 2 * 1.1;
const ENEMY_BOUNDS_Y_SPAWN = VIEW_HEIGHT / 2 * 1.1;

// Placeholder collision thresholds - TUNE BASED ON MODEL SIZE
const ENEMY_PROJECTILE_COLLISION_THRESHOLD = 1.0;
const PLAYER_ENEMY_COLLISION_THRESHOLD = 1.2;

// --- ID Counters ---
let nextProjectileId = 0;
let nextEnemyId = 0;

// --- Zustand Store Definition ---
export const useGameStore = create((set, get) => ({
    // --- Core State ---
    score: 0,
    gameState: GameStates.MENU,
    isConnected: false,
    leaderboardData: [],
    lastSubmissionError: null,

    // --- Game State ---
    playerInput: { left: false, right: false, shoot: false },
    playerPosition: new THREE.Vector3(0, PLAYER_Y_POSITION, 0),
    projectiles: [], // Array<{id: number, position: Vector3}>
    enemies: [],     // Array<{id: number, position: Vector3, speed: number}> // Simplified enemy state
    lastShotTime: 0,
    enemySpawnTimer: ENEMY_SPAWN_RATE_INITIAL,

    // --- Core Actions (WebSockets, Leaderboard, Connection Status) ---
    // (Keep these as they were - initializeWebSocketListeners, connectWebSocket, etc.)
    setIsConnected: (status) => set({ isConnected: status }),
    setLeaderboardData: (data) => set({ leaderboardData: data || [] }),
    setLastSubmissionError: (error) => set({ lastSubmissionError: error }),
    connectWebSocket: () => { /* ... keep existing ... */ },
    disconnectWebSocket: () => { /* ... keep existing ... */ },
    submitScore: (email) => { /* ... keep existing ... */ },
    requestLeaderboard: () => { /* ... keep existing ... */ },
    initializeWebSocketListeners: () => { /* ... keep existing ... */ },


    // --- Game Logic Actions ---
    setScore: (newScore) => set({ score: newScore }),
    resetScore: () => set({ score: 0 }),
    setGameState: (newState) => {
        console.log("Setting game state:", newState);
        const oldState = get().gameState;
        set({ gameState: newState, lastSubmissionError: null });
        if (newState === GameStates.PLAYING && (oldState === GameStates.MENU || oldState === GameStates.SUBMITTED)) {
            get().resetGameElements();
        }
    },
    setPlayerInput: (input) => set((state) => ({ playerInput: { ...state.playerInput, ...input } })),


    // --- THE MAIN GAME LOOP LOGIC ---
    updateGameFrame: (delta, elapsedTime) => {
        const state = get();
        if (state.gameState !== GameStates.PLAYING) return;

        let {
            score, playerInput, playerPosition, projectiles, enemies, lastShotTime,
            enemySpawnTimer
        } = state;
        let gameOver = false;

        // --- 1. Update Player Position ---
        const moveDelta = PLAYER_SPEED * delta;
        let newPlayerX = playerPosition.x;
        if (playerInput.left) newPlayerX -= moveDelta;
        if (playerInput.right) newPlayerX += moveDelta;
        newPlayerX = THREE.MathUtils.clamp(newPlayerX, -PLAYER_BOUNDS_X, PLAYER_BOUNDS_X);
        const newPlayerPosition = playerPosition.clone().setX(newPlayerX);

        // --- 2. Handle Shooting (Simple Single Shot) ---
        let newProjectiles = [...projectiles];
        let newLastShotTime = lastShotTime;
        if (playerInput.shoot && elapsedTime > lastShotTime + FIRE_RATE) {
            newLastShotTime = elapsedTime;
            // Single projectile from near player position
            newProjectiles.push({
                id: nextProjectileId++,
                position: newPlayerPosition.clone().setY(PLAYER_Y_POSITION + 1.0), // Adjust Y offset
            });
        }

        // --- 3. Update Projectile Positions & Remove Off-screen ---
        newProjectiles = newProjectiles
            .map(p => ({ ...p, position: p.position.clone().setY(p.position.y + PROJECTILE_SPEED * delta) }))
            .filter(p => p.position.y < PROJECTILE_BOUNDS_Y);

        // --- 4. Update Enemy Spawn Timer & Spawn Enemies ---
        let newEnemies = [...enemies];
        let newEnemySpawnTimer = enemySpawnTimer - delta;
        if (newEnemySpawnTimer <= 0) {
            const currentSpawnRate = Math.max(0.2, ENEMY_SPAWN_RATE_INITIAL - score * ENEMY_SPAWN_RATE_SCALE);
            newEnemySpawnTimer = currentSpawnRate;
            newEnemies.push({
                id: nextEnemyId++,
                position: new THREE.Vector3(
                    THREE.MathUtils.randFloat(-PLAYER_BOUNDS_X, PLAYER_BOUNDS_X),
                    ENEMY_BOUNDS_Y_SPAWN,
                    0
                ),
                speed: ENEMY_BASE_SPEED + THREE.MathUtils.randFloat(0, score * 0.005),
                // No drift or color needed in this reverted version
            });
        }

        // --- 5. Update Enemy Positions (Move Down), Check Bottom Boundary ---
        let enemiesReachedBottom = false;
        newEnemies = newEnemies.map(e => {
            const newY = e.position.y - e.speed * delta; // Move down only
            if (newY < ENEMY_BOUNDS_Y_DESPAWN) {
                 console.log(`!!! GAME OVER Check: Enemy ${e.id} reached bottom (${newY.toFixed(2)} < ${ENEMY_BOUNDS_Y_DESPAWN})`); // <<< KEEP DEBUG LOG
                enemiesReachedBottom = true;
            }
            // No drift calculation needed here
            return { ...e, position: e.position.clone().setY(newY) };
        });
        if (enemiesReachedBottom) gameOver = true;
        newEnemies = newEnemies.filter(e => e.position.y > ENEMY_BOUNDS_Y_DESPAWN - 1);

        // --- 6. Collision Detection (Projectiles vs Enemies) ---
        const projectilesToRemove = new Set();
        const enemiesToRemove = new Set();
        let scoreToAdd = 0;
        for (const proj of newProjectiles) {
            if (projectilesToRemove.has(proj.id)) continue;
            for (const enemy of newEnemies) {
                if (enemiesToRemove.has(enemy.id)) continue;
                const distance = proj.position.distanceTo(enemy.position);
                if (distance < ENEMY_PROJECTILE_COLLISION_THRESHOLD) { // Use correct threshold
                    projectilesToRemove.add(proj.id);
                    enemiesToRemove.add(enemy.id);
                    scoreToAdd += 10;
                    break;
                }
            }
        }
        newProjectiles = newProjectiles.filter(p => !projectilesToRemove.has(p.id));
        newEnemies = newEnemies.filter(e => !enemiesToRemove.has(e.id));
        const newScore = score + scoreToAdd;

         // --- 7. Collision Detection (Enemies vs Player) ---
         let playerHit = false;
         if (!gameOver) {
             // console.log(`Player Pos Check: (${newPlayerPosition.x.toFixed(2)}, ${newPlayerPosition.y.toFixed(2)})`); // <<< DEBUG LOG
             for (const enemy of newEnemies) {
                 const distance = enemy.position.distanceTo(newPlayerPosition);
                 // console.log(`Enemy ${enemy.id} Dist to Player: ${distance.toFixed(2)} (Threshold: ${PLAYER_ENEMY_COLLISION_THRESHOLD.toFixed(2)})`); // <<< DEBUG LOG
                 if (distance < PLAYER_ENEMY_COLLISION_THRESHOLD) { // Use correct threshold
                      console.log(`!!! GAME OVER Check: Enemy ${enemy.id} collided with player (dist: ${distance.toFixed(2)})`); // <<< KEEP DEBUG LOG
                     playerHit = true;
                     break;
                 }
             }
         }
         if (playerHit) gameOver = true;

         // --- 8. NO Power Up Check in this version ---

        // --- 9. Update Zustand State ---
         console.log(`End of frame: gameOver = ${gameOver}`); // <<< KEEP DEBUG LOG
         const finalStateUpdate = {
            playerPosition: newPlayerPosition,
            projectiles: newProjectiles,
            enemies: newEnemies,
            lastShotTime: newLastShotTime,
            enemySpawnTimer: newEnemySpawnTimer,
            score: newScore, // Update score
            ...(gameOver && { gameState: GameStates.GAME_OVER }) // Set game over state if flag is true
        };
        // console.log("Final state update object:", finalStateUpdate); // <<< DEBUG LOG
        set(finalStateUpdate);

         // --- 10. NO Power up action call needed ---

    }, // End of updateGameFrame


    // --- Action to Reset Game Elements ---
    resetGameElements: () => {
         console.log("Resetting game elements (reverted state)");
         nextProjectileId = 0;
         nextEnemyId = 0;
         set({
             score: 0,
             playerPosition: new THREE.Vector3(0, PLAYER_Y_POSITION, 0),
             projectiles: [],
             enemies: [],
             lastShotTime: 0,
             enemySpawnTimer: ENEMY_SPAWN_RATE_INITIAL,
             // No power level state to reset here
             playerInput: { left: false, right: false, shoot: false },
         });
    }

})); // End of create