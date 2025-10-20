import * as THREE from "three";
import { tileSize } from "../constants";
import { Wheel } from "./Wheel";

export function Truck(initialTileIndex, direction, color) {
    const truck = new THREE.Group();
    truck.position.x = initialTileIndex * tileSize;
    if (!direction) truck.rotation.z = Math.PI;

    // === CARGO ===
    const cargo = new THREE.Mesh(
        new THREE.BoxGeometry(70, 35, 35),
        new THREE.MeshLambertMaterial({ color: 0xb4c6fc, flatShading: true })
    );
    cargo.position.set(-15, 0, 25);
    cargo.castShadow = true;
    cargo.receiveShadow = true;
    truck.add(cargo);

    // === CABIN ===
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(30, 30, 30),
        new THREE.MeshLambertMaterial({ color, flatShading: true })
    );
    cabin.position.set(35, 0, 20);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    truck.add(cabin);

    // === WINDOWS ===
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb, flatShading: true });
    const frontWindow = new THREE.Mesh(new THREE.BoxGeometry(1, 20, 13), windowMaterial);
    frontWindow.position.set(50, 0, 25);
    truck.add(frontWindow);

    // === SIDE WINDOWS ===
    const sideWindowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb, flatShading: true });

    // Left side window
    const leftSideWindow = new THREE.Mesh(new THREE.BoxGeometry(18, 1, 10), sideWindowMaterial);
    leftSideWindow.position.set(35, -16, 25);
    truck.add(leftSideWindow);

    // Right side window (mirror)
    const rightSideWindow = new THREE.Mesh(new THREE.BoxGeometry(18, 1, 10), sideWindowMaterial);
    rightSideWindow.position.set(35, 16, 25);
    truck.add(rightSideWindow);
    // === LIGHTS ===
    const lightMaterialFront = new THREE.MeshLambertMaterial({ color: 0xffff99 });
    const leftFrontLight = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 5), lightMaterialFront);
    leftFrontLight.position.set(50, -10, 10);
    const rightFrontLight = leftFrontLight.clone();
    rightFrontLight.position.y = 10;
    truck.add(leftFrontLight, rightFrontLight);

    const lightMaterialRear = new THREE.MeshLambertMaterial({ color: 0xff3333 });
    const leftRearLight = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 5), lightMaterialRear);
    leftRearLight.position.set(-50, -10, 10);
    const rightRearLight = leftRearLight.clone();
    rightRearLight.position.y = 10;
    truck.add(leftRearLight, rightRearLight);

    // === BUMPERS ===
    const bumperMaterial = new THREE.MeshLambertMaterial({ color: 0x22223422 });
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(5, 28, 8), bumperMaterial);
    frontBumper.position.set(50, 0, 6);
    const rearBumper = frontBumper.clone();
    rearBumper.position.x = -50;
    truck.add(frontBumper, rearBumper);

    // === WHEELS ===
    const wheelOffsetY = 8;
    const wheelPositions = [37, 15, -25, -35]; // front, middle, back
    wheelPositions.forEach((x) => {
        const leftWheel = Wheel(x);
        leftWheel.position.y = -wheelOffsetY;
        const rightWheel = Wheel(x);
        rightWheel.position.y = wheelOffsetY;
        truck.add(leftWheel, rightWheel);
    });

    return truck;
}
