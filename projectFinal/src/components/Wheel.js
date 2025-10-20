import * as THREE from "three";

export function Wheel(x) {
  const group = new THREE.Group();

  
  const tire = new THREE.Mesh(
    new THREE.BoxGeometry(10, 25, 10), 
    new THREE.MeshLambertMaterial({ color: 0x333333, flatShading: true })
  );
  tire.position.x = x;
  tire.position.z = 4;
  group.add(tire);

  const hub = new THREE.Mesh(
    new THREE.BoxGeometry(4, 15, 4),
    new THREE.MeshLambertMaterial({ color: 0x888888, flatShading: true })
  );
  hub.position.set(x, 0, 4);
  group.add(hub);

  return group;
}
