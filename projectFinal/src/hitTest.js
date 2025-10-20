import * as THREE from "three";
import { metadata as rows } from "./components/Map";
import { player, position, movesQueue, playerState } from "./components/Player";
import { gameState } from "./gameState";
import { tileSize } from "./constants";
import { playerAnimator } from "./playerAnimator.js";


const resultDOM = document.getElementById("result-container");
const finalScoreDOM = document.getElementById("final-score");

export function triggerGameOver() {
    gameState.isGameOver = true;
    playerState.isGameOver = true;
    movesQueue.length = 0;

    if (!resultDOM || !finalScoreDOM) return;
    resultDOM.style.visibility = "visible";
    finalScoreDOM.innerText = position.currentRow.toString();
}

const playerCollisionSize = {
    width: tileSize * 0.8,
    depth: tileSize * 0.8
};

const logWorldPosition = new THREE.Vector3();

export function hitTest() {
    if (gameState.isGameOver) return;

    const row = rows[position.currentRow - 1];
    if (!row) return;

    if (row.type === "car" || row.type === "truck") {
        const playerBoundingBox = new THREE.Box3().setFromObject(player);
        row.vehicles.forEach(({ ref }) => {
            if (!ref) return;
            const vehicleBoundingBox = new THREE.Box3().setFromObject(ref);
            if (playerBoundingBox.intersectsBox(vehicleBoundingBox)) {
                triggerGameOver();
            }
        });
    }

    if (row.type === "river") {
        let isPlayerOnLog = false;

        const playerLeft = player.position.x - playerCollisionSize.width / 2;
        const playerRight = player.position.x + playerCollisionSize.width / 2;
        const playerFront = player.position.y + playerCollisionSize.depth / 2;
        const playerBack = player.position.y - playerCollisionSize.depth / 2;

        for (const logData of row.logs) {
            const logMesh = logData.ref;
            if (!logMesh) continue;

            logMesh.getWorldPosition(logWorldPosition);

            const logWidth = logData.length * tileSize;
            const logDepth = tileSize * 0.8;

            const logLeft = logWorldPosition.x - logWidth / 2;
            const logRight = logWorldPosition.x + logWidth / 2;
            const logFront = logWorldPosition.y + logDepth / 2;
            const logBack = logWorldPosition.y - logDepth / 2;

            if (
                playerRight > logLeft &&
                playerLeft < logRight &&
                playerFront > logBack &&
                playerBack < logFront
            ) {
                isPlayerOnLog = true;
                break;
            }
        }

        if (!isPlayerOnLog && !playerState.isAnimating && !playerState.isSinking) {
           startSinkAnimation();
        }
    }
}

function startSinkAnimation() {
    playerState.isSinking = true;
    gameState.isGameOver = true; 
    movesQueue.length = 0;

    const sinkStart = player.position.z-10;
    const sinkDepth = -20;       
    const sinkDuration = 2.0;    
    const startTime = performance.now();

    const raiseAngle = Math.PI / 3;

    function sinkStep() {
        const elapsed = (performance.now() - startTime) / 1000;
        const t = Math.min(1, elapsed / sinkDuration);

        player.position.z = THREE.MathUtils.lerp(sinkStart, sinkDepth, t * t);

        if (t < 1) {
            requestAnimationFrame(sinkStep);
        } else {

            playerState.isSinking = false;
            playerState.isAnimating = false;

            triggerGameOver();
        }
    }

    sinkStep();
}
