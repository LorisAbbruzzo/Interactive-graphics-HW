import * as THREE from "three";
import { tileSize } from "../constants";
import { Wheel } from "./Wheel";

export function Car(initialTileIndex, direction, color) {
    const scaleFactor = 0.8; 
    const car = new THREE.Group();
    car.position.x = initialTileIndex * tileSize;
    if (!direction) car.rotation.z = Math.PI;

    const main = new THREE.Mesh(
        new THREE.BoxGeometry(60 * scaleFactor, 30 * scaleFactor, 15 * scaleFactor),
        new THREE.MeshLambertMaterial({ color, flatShading: true })
    );
    main.castShadow = true;
    main.receiveShadow = true;
    main.position.z = 12 * scaleFactor;
    car.add(main);


    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(36 * scaleFactor, 26 * scaleFactor, 18 * scaleFactor),
        new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true })
    );
    cabin.position.set(-5 * scaleFactor, 0, 25 * scaleFactor);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    car.add(cabin);

  
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb, flatShading: true });

    const frontWindow = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 19, 8), 
        windowMaterial
    );
    frontWindow.position.set(10, 0, 22); 
    car.add(frontWindow);

    const backWindow = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 19, 8), 
        windowMaterial
    );
    backWindow.position.set(-18, 0, 22); 
    car.add(backWindow);

    const lightMaterial = new THREE.MeshLambertMaterial({ color: 0xffff99 });
    const leftLight = new THREE.Mesh(new THREE.BoxGeometry(3 * scaleFactor, 5 * scaleFactor, 5 * scaleFactor), lightMaterial);
    leftLight.position.set(30 * scaleFactor, -10 * scaleFactor, 12 * scaleFactor);
    const rightLight = leftLight.clone();
    rightLight.position.y = 10 * scaleFactor;
    car.add(leftLight, rightLight);

    const rearMaterial = new THREE.MeshLambertMaterial({ color: 0xff3333 });
    const leftRear = new THREE.Mesh(new THREE.BoxGeometry(3 * scaleFactor, 5 * scaleFactor, 5 * scaleFactor), rearMaterial);
    leftRear.position.set(-30 * scaleFactor, -10 * scaleFactor, 12 * scaleFactor);
    const rightRear = leftRear.clone();
    rightRear.position.y = 10 * scaleFactor;
    car.add(leftRear, rightRear);

    const bumperMaterial = new THREE.MeshLambertMaterial({ color: 0x22223422 });
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(5 * scaleFactor, 28 * scaleFactor, 8 * scaleFactor), bumperMaterial);
    frontBumper.position.set(32 * scaleFactor, 0, 6 * scaleFactor);
    const rearBumper = frontBumper.clone();
    rearBumper.position.x = -32 * scaleFactor;
    car.add(frontBumper, rearBumper);

    
    const frontWheelLeft = Wheel(18);
    frontWheelLeft.position.y = -2;
    const frontWheelRight = Wheel(18);
    frontWheelRight.position.y = 2;

    const backWheelLeft = Wheel(-18);
    backWheelLeft.position.y = -2;
    const backWheelRight = Wheel(-18);
    backWheelRight.position.y = 2;

    car.add(frontWheelLeft, frontWheelRight, backWheelLeft, backWheelRight);

    return car;
};

