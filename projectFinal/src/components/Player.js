import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { endsUpInValidPosition } from "../utilities/endsUpInValidPosition";
import { metadata as rows, addRows } from "./Map";
import { gameState } from "../gameState";

class Player extends THREE.Group {
    constructor() {
        super();
        this.model = null;
        this.bodyParts = {
            leftArm: null,
            rightArm: null,
            leftLeg: null,
            rightLeg: null,
        };
    }

    async loadModel() {
        const loader = new GLTFLoader();

        try {
            const gltf = await loader.loadAsync('/steve2.glb');
            this.model = gltf.scene;

            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }

                switch (child.name) {
                    case 'Left_Arm_9':
                        this.bodyParts.leftArm = child;
                        break;
                    case 'Right_Arm_6':
                        this.bodyParts.rightArm = child;
                        break;
                    case 'Left_Leg_15':
                        this.bodyParts.leftLeg = child;
                        break;
                    case 'Right_Leg_12':
                        this.bodyParts.rightLeg = child;
                        break;
                }
            });

            this.model.scale.set(13, 13, 13);
            this.model.rotation.x = -Math.PI/2;
            this.model.rotation.z = Math.PI;
            this.model.rotation.y = Math.PI;

            if (this.bodyParts.leftArm) this.reparentLimb(this.bodyParts.leftArm);
            if (this.bodyParts.rightArm) this.reparentLimb(this.bodyParts.rightArm);
            if (this.bodyParts.leftLeg) this.reparentLimb(this.bodyParts.leftLeg);
            if (this.bodyParts.rightLeg) this.reparentLimb(this.bodyParts.rightLeg);

            this.add(this.model);

        } catch (error) {
            console.error('Failed to load player model:', error);
        }
    }

    reparentLimb(limb) {
        if (!limb || !limb.parent) return;
        const pivot = new THREE.Group();
        limb.parent.add(pivot);

        this.model.updateMatrixWorld(true);

        const worldPosition = new THREE.Vector3();
        limb.getWorldPosition(worldPosition);

        limb.parent.worldToLocal(worldPosition);
        pivot.position.copy(worldPosition);

        const box = new THREE.Box3().setFromObject(limb);
        const height = box.max.y - box.min.y;

        pivot.attach(limb);
        limb.position.set(0, -height / 2, 0);
        pivot.position.y += height / 2;

        for (const part in this.bodyParts) {
            if (this.bodyParts[part] === limb) {
                this.bodyParts[part] = pivot;
                break;
            }
        }
    }
}

export const player = new Player();
export const playerState = { isAnimating: false, isGameOver: false, isSinking: false};
export const position = { currentRow: 0, currentTile: 0 };
export const movesQueue = [];
export let startPosition = new THREE.Vector3();

export async function initializePlayer() {
    if (player.model) {
        player.remove(player.model);
        player.model = null;
    }

    gameState.isGameOver = false;
    playerState.isGameOver = false;
    playerState.isAnimating = false;
    playerState.gameOverAnimationDone = false;

    movesQueue.length = 0;
    position.currentRow = 0;
    position.currentTile = 0;

    startPosition.set(0, 0, 0);

    await player.loadModel();
    player.position.set(0, 0, 0);

}

export function queueMove(direction) {
    const isValidMove = endsUpInValidPosition({
        rowIndex: position.currentRow,
        tileIndex: position.currentTile,
    }, [...movesQueue, direction]);
    if (!isValidMove) return;
    movesQueue.push(direction);
}

export function stepCompleted() {
    const direction = movesQueue.shift();
    if (gameState.isGameOver) return;

    if (direction === "forward") position.currentRow += 1;
    if (direction === "backward") position.currentRow -= 1;
    if (direction === "left") position.currentTile -= 1;
    if (direction === "right") position.currentTile += 1;

    if (position.currentRow > rows.length - 10) addRows();

    const scoreDOM = document.getElementById("score");
    if (scoreDOM) scoreDOM.innerText = position.currentRow.toString();
}
