import * as THREE from "three";
import { tileSize } from "../constants";

export function Tree(tileIndex) {
  const tree = new THREE.Group();
  tree.position.x = tileIndex * tileSize;

  const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x5a3a22, flatShading: true });
  const leafMaterialDark = new THREE.MeshLambertMaterial({ color: 0x3d661b, flatShading: true });
  const leafMaterialMid = new THREE.MeshLambertMaterial({ color: 0x5a8a25, flatShading: true });
  const leafMaterialLight = new THREE.MeshLambertMaterial({ color: 0x7aa21d, flatShading: true });

  const cubeSize = tileSize * 0.25;

  
  const trunkHeightInCubes = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < trunkHeightInCubes; i++) {
    const trunk = new THREE.Mesh(
      new THREE.BoxGeometry(cubeSize * 0.9, cubeSize * 0.9, cubeSize),
      trunkMaterial
    );
    
    trunk.position.z = i * cubeSize + (cubeSize / 2);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);
  }

  //CROWN STARTING POSITION
  const crownStartHeight = trunkHeightInCubes * cubeSize;
  const leafSize = cubeSize * 0.9;
  const leafRadius = tileSize * 0.56; 

  for (let x = -leafRadius; x <= leafRadius; x += leafSize) {
    for (let y = -leafRadius; y <= leafRadius; y += leafSize) {
      for (let z = 0; z <= leafRadius * 2.4; z += leafSize) {
        const dist = Math.sqrt(
          (x / leafRadius) ** 2 +
          (y / leafRadius) ** 2 +
          ((z - leafRadius) / (leafRadius * 1.2)) ** 2
        );
        if (dist < 1.0 + Math.random() * 0.3) {
          const shade = Math.random();
          const material =
            shade < 0.33
              ? leafMaterialDark
              : shade < 0.66
              ? leafMaterialMid
              : leafMaterialLight;

          const leaf = new THREE.Mesh(
            new THREE.BoxGeometry(leafSize, leafSize, leafSize),
            material
          );
          
          leaf.position.set(x, y, crownStartHeight + z + (leafSize / 2));
          leaf.castShadow = true;
          leaf.receiveShadow = true;
          tree.add(leaf);
        }
      }
    }
  }

  return tree;
}
