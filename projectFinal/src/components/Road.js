import * as THREE from "three";
import {
    tilesPerRow,
    tileSize,
    minWalkable,
    maxWalkable
} from "../constants";

export function Road(rowIndex) {
    const road = new THREE.Group();
    road.position.y = rowIndex * tileSize;

    const rowThickness = 10;

    const baseAsphaltColor = 0x454a59;
    const walkableAsphaltMaterial = new THREE.MeshLambertMaterial({ color: baseAsphaltColor });
    const boundaryAsphaltMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color(baseAsphaltColor).multiplyScalar(0.7)
    });
    const sideMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });

    const tileGeometry = new THREE.BoxGeometry(tileSize, tileSize, rowThickness);
    const halfWidth = Math.floor(tilesPerRow / 2);

    for (let i = -halfWidth; i <= halfWidth; i++) {
        const isWalkable = (i >= minWalkable && i <= maxWalkable);
        const topMaterial = isWalkable ? walkableAsphaltMaterial : boundaryAsphaltMaterial;

        const tile = new THREE.Mesh(
            tileGeometry,
            [
                sideMaterial, 
                sideMaterial, 
                topMaterial,  
                sideMaterial, 
                sideMaterial, 
                sideMaterial  
            ]
        );
        tile.position.x = i * tileSize;
        tile.position.z = -rowThickness / 2;
        tile.receiveShadow = true;
        road.add(tile);
    }

    //DASHED LINE
    const numberOfDashes = 20;
    const dashLength = 15;
    const dashWidth = 5;
    const dashThickness = 1;

    const dashMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const dashGeometry = new THREE.BoxGeometry(dashLength, dashWidth, dashThickness);

    const totalRoadWidth = tilesPerRow * tileSize;
    const spacing = totalRoadWidth / numberOfDashes;
    const startOffset = -totalRoadWidth / 2 + spacing / 2;

    for (let i = 0; i < numberOfDashes; i++) {
        const dash = new THREE.Mesh(dashGeometry, dashMaterial);

        dash.position.x = startOffset + i * spacing;

        dash.position.y = 0; 

        dash.position.z = dashThickness / 2;

        dash.receiveShadow = true;
        road.add(dash);
    }

    return road;
}
