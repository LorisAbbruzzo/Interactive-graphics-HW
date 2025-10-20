import * as THREE from "three";
import {
    tilesPerRow,
    tileSize,
    minWalkable, 
    maxWalkable
} from "../constants";

export function River(rowIndex) {
    const river = new THREE.Group();
    river.position.y = rowIndex * tileSize;
    river.position.z = -10; 

    const walkableWaterMaterial = new THREE.MeshLambertMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.85
    });

    const boundaryWaterMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color(0x3b82f6).multiplyScalar(0.9), 
        transparent: true,
        opacity: 0.95 
    });
    const tileGeometry = new THREE.PlaneGeometry(tileSize, tileSize);
    const halfWidth = Math.floor(tilesPerRow / 2);

    for (let i = -halfWidth; i <= halfWidth; i++) {
        const isWalkable = (i >= minWalkable && i <= maxWalkable);
        const tileMaterial = isWalkable ? walkableWaterMaterial : boundaryWaterMaterial;

        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        tile.position.x = i * tileSize;
        tile.receiveShadow = true;
        river.add(tile);
    }

    return river;
}