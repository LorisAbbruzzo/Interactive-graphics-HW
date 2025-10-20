import * as THREE from "three";
import { tilesPerRow, tileSize } from "./constants";
import { metadata as rows } from "./components/Map";
// MODIFIED: Import playerState to check the isAnimating flag
import { player, position, playerState } from "./components/Player"; 

const mapLimit = (tilesPerRow * tileSize) / 2;

const playerCollisionSize = {
    width: tileSize * 0.8,
    depth: tileSize * 0.8
};

// Creiamo anche qui un vettore da riutilizzare
const logWorldPosition = new THREE.Vector3();

// --- NEW: Animation constants ---
const SINK_DEPTH = -2;       // How far the log sinks
const REST_POSITION_Y = 0;   // The log's default Y position
const LERP_FACTOR = 1;     // How fast the animation is (0.0 - 1.0)

export function animateLogs() {
    rows.forEach((row, rowIndex) => {
        if (row.type !== "river") return;

        const moveDirection = row.direction ? -1 : 1;
        const moveDistance = (moveDirection * row.speed * 0.001) / 1.5;

        let isPlayerOnThisRow = position.currentRow - 1 === rowIndex;

        row.logs.forEach(({ ref: log, length: logLength }) => {
            if (!log) return;
            
            // 1. Move log horizontally (as before)
            log.position.x += moveDistance;

            // --- 2. SINK/RISE ANIMATION LOGIC ---

            // Initialize targetY on the log mesh itself if it's not there
            if (log.targetY === undefined) { // <-- NEW
                log.targetY = REST_POSITION_Y; // <-- NEW
                log.position.y = REST_POSITION_Y; // <-- NEW (Ensure it starts at rest)
            }

            let isPlayerOnThisSpecificLog = false; // <-- NEW

            // 3. Collision check (re-using your existing logic)
            if (isPlayerOnThisRow) {
                const playerLeft = player.position.x - playerCollisionSize.width / 2;
                const playerRight = player.position.x + playerCollisionSize.width / 2;
                const playerFront = player.position.y + playerCollisionSize.depth / 2;
                const playerBack = player.position.y - playerCollisionSize.depth / 2;
                
                log.getWorldPosition(logWorldPosition);

                const logWidth = logLength * tileSize;
                const logDepth = tileSize * 0.8;

                const logLeft = logWorldPosition.x - logWidth / 2;
                const logRight = logWorldPosition.x + logWidth / 2;
                const logFront = logWorldPosition.y + logDepth / 2;
                const logBack = logWorldPosition.y - logDepth / 2;

                if (playerRight > logLeft && playerLeft < logRight && playerFront > logBack && playerBack < logFront) {
                    
                    isPlayerOnThisSpecificLog = true; // <-- NEW
                    
                    // Move player with the log (as before)
                    player.position.x += moveDistance;
                    
                }
            }

            // 4. Set the animation target based on collision AND player state
            // We use !playerState.isAnimating so the log only sinks *after* the jump is complete.
            if (isPlayerOnThisSpecificLog) { // <-- MODIFIED
                log.targetY = SINK_DEPTH; // <-- NEW
            } else {
                log.targetY = REST_POSITION_Y; // <-- NEW
            }

            // 5. Animate the log's Y position every frame
            log.position.y = THREE.MathUtils.lerp(log.position.y, log.targetY, LERP_FACTOR); // <-- NEW

            // 6. Gestione del wrap-around (invariata)
            if (log.position.x > mapLimit + tileSize * 2) {
                log.position.x = -mapLimit - tileSize * 2;
            } else if (log.position.x < -mapLimit - tileSize * 2) {
                log.position.x = mapLimit + tileSize * 2;
            }
        });
    });
}