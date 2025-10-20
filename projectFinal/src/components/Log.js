import * as THREE from "three";
import { tileSize } from "../constants";

export function Log(initialTileIndex, length = 3) {
    const log = new THREE.Group();
    log.position.x = initialTileIndex * tileSize;

    const logLength = length * tileSize;
    const logRadius = tileSize * 0.31; 

    const createEndTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');

        context.fillStyle = '#d2b48c';
        context.fillRect(0, 0, 64, 64);

     
        context.strokeStyle = '#8b5a2b';
        context.lineWidth = 2;

        //Log insied
        for (let i = 1; i < 6; i++) {
            context.beginPath();
            context.arc(32, 32, i * 5, 0, 2 * Math.PI);
            context.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    };

    
    const createBarkTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');

       
        context.fillStyle = '#5C4033'; 
        context.fillRect(0, 0, 128, 128);

  
        context.strokeStyle = '#6B4226';
        context.lineWidth = 3;
        for (let i = 0; i < 20; i++) {
            context.beginPath();
            context.moveTo(Math.random() * 128, 0);
            context.lineTo(Math.random() * 128, 128);
            context.stroke();
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(length * 2, 2);
        texture.colorSpace = THREE.SRGBColorSpace;

        return texture;
    }

   
    const barkMaterial = new THREE.MeshLambertMaterial({ map: createBarkTexture() });
    const endMaterial = new THREE.MeshLambertMaterial({ map: createEndTexture() });

  
    const logGeometry = new THREE.CylinderGeometry(logRadius, logRadius, logLength, 8); 

   
    const logMesh = new THREE.Mesh(logGeometry, [barkMaterial, endMaterial, endMaterial]);

    
    logMesh.rotation.z = Math.PI / 2;
    logMesh.rotation.x = Math.PI/2;
   
    logMesh.position.y = -tileSize / 2 + logRadius;
    logMesh.userData = { baseY: logMesh.position.y };
    logMesh.castShadow = true;
    logMesh.receiveShadow = true;
    log.add(logMesh);



    return log;
}