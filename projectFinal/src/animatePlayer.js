import * as THREE from "three";
import { player, position, movesQueue, stepCompleted, playerState, startPosition } from "./components/Player";
import { tileSize } from "./constants";
import { playerAnimator } from "./playerAnimator.js";
import { triggerGameOver } from "./hitTest.js";

const moveClock = new THREE.Clock(false);
let targetRotation = Math.PI;


export function animatePlayer() {
    if (playerState.isSinking) return;
    if (playerState.isGameOver) {
        if (!moveClock.running) moveClock.start();

        const stepTime = 0.5;
        const progress = Math.min(1, moveClock.getElapsedTime() / stepTime);

        playerAnimator.update(player, progress);

        if (progress >= 1) {
            moveClock.stop();
            playerState.isAnimating = false;
            playerState.gameOverAnimationDone = true;
            triggerGameOver();
        }
        return;
    }

    if (!movesQueue.length) {
        if (player.bodyParts.leftArm) playerAnimator.reset(player);
        return;
    }

    if (!moveClock.running) {
        moveClock.start();
        moveClock.elapsedTime = 0;
        playerState.isAnimating = true;

        startPosition.copy(player.position);


        switch (movesQueue[0]) {
            case "forward":
                targetRotation = Math.PI;        
                break;
            case "backward":
                targetRotation = 0;              
                break;
            case "left":
                targetRotation = Math.PI / 2;    
                break;
            case "right":
                targetRotation = -Math.PI / 2;   
                break;
        }
    }

    const stepTime = 0.2;
    const progress = Math.min(1, moveClock.getElapsedTime() / stepTime);

    setPosition(progress);
    setRotation();
    playerAnimator.update(player, progress);

    if (progress >= 1) {
        stepCompleted();
        moveClock.stop();
        playerState.isAnimating = false;
    }
}

function setPosition(progress) {
    let endX = startPosition.x;
    let endY = startPosition.y;

    if (movesQueue[0] === "left") endX -= tileSize;
    if (movesQueue[0] === "right") endX += tileSize;
    if (movesQueue[0] === "forward") endY += tileSize;
    if (movesQueue[0] === "backward") endY -= tileSize;

    player.position.x = THREE.MathUtils.lerp(startPosition.x, endX, progress);
    player.position.y = THREE.MathUtils.lerp(startPosition.y, endY, progress);

    const groundHeight = 0;
    const jumpHeight = 5;
    player.position.z = groundHeight + Math.sin(progress * Math.PI) * jumpHeight;
}

function setRotation() {
    if (!player.model) return;
    player.model.rotation.y = THREE.MathUtils.lerp(player.model.rotation.y, targetRotation, 0.5);
}


