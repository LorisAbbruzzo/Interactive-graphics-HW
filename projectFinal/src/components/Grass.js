import * as THREE from "three";
import { 
    tilesPerRow, 
    tileSize, 
    minWalkable,
    maxWalkable
} from "../constants";

export function Grass(rowIndex) {
  const grass = new THREE.Group();
  grass.position.y = rowIndex * tileSize;

  const rowThickness = 10;
  

  const baseColor = 0x78b14b; 
  const walkableGrassMaterial = new THREE.MeshLambertMaterial({ 
    color: baseColor 
  });
  const boundaryGrassMaterial = new THREE.MeshLambertMaterial({ 
    color: new THREE.Color(baseColor).multiplyScalar(0.80) 
  });
  const dirtMaterial = new THREE.MeshLambertMaterial({ color: 0x5c332e });

  const tileGeometry = new THREE.BoxGeometry(tileSize, tileSize, rowThickness);
  
  const halfWidth = Math.floor(tilesPerRow / 2);

  for (let i = -halfWidth; i <= halfWidth; i++) {

    const isWalkable = (i >= minWalkable && i <= maxWalkable);
    
   
    const topMaterial = isWalkable ? walkableGrassMaterial : boundaryGrassMaterial;


    const tile = new THREE.Mesh(
      tileGeometry,
      [
        dirtMaterial,       
        dirtMaterial,       
        dirtMaterial,       
        dirtMaterial,      
        topMaterial,       
        dirtMaterial,       
      ]
    );

    tile.position.x = i * tileSize;
    tile.position.z = -rowThickness / 2;
    tile.receiveShadow = true;
    grass.add(tile);
  }

  //SPIKES
  const bladeGeometry = new THREE.ConeGeometry(0.4, 7.0, 7);
  const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0x6ea94d });
  const bladesCount = 15000;

  const blades = new THREE.InstancedMesh(bladeGeometry, bladeMaterial, bladesCount);
  const dummy = new THREE.Object3D();

  const bladeData = [];

  for (let i = 0; i < bladesCount; i++) {
    const x = (Math.random() - 0.5) * tilesPerRow * tileSize;
    const y = (Math.random() - 0.5) * tileSize;
    const z = 0.9;

    dummy.position.set(x, y, z);
    dummy.rotation.x = Math.PI / 2; 
    dummy.rotation.z = Math.random() * Math.PI * 2;

    const s = 0.8 + Math.random() * 0.8;
    dummy.scale.set(s, s, s);

    dummy.updateMatrix();
    blades.setMatrixAt(i, dummy.matrix);

    bladeData.push({
        x, y, z,
        phase: Math.random() * Math.PI * 2,
        amp: 0.05 + Math.random() * 0.05, 
        speed: 0.5 + Math.random() * 0.3  
    });
  }
  grass.userData = { blades, bladeData, dummy };

  blades.receiveShadow = true;
  grass.add(blades);

  return grass;
}
