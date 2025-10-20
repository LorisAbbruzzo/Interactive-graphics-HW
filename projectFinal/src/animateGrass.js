import * as THREE from "three";

export function animateGrass(grassGroup, elapsedTime) {
  const data = grassGroup.userData;
  if (!data || !data.blades || !data.bladeData) return;

  const { blades, bladeData, dummy } = data;

  
  const baseWind = Math.sin(elapsedTime * 0.2) * 0.1;  
  const gust = Math.sin(elapsedTime * 0.8) *0.8;     
  const windStrength = baseWind + gust;

  
  blades.instanceMatrix.needsUpdate = true;

  for (let i = 0; i < bladeData.length; i++) {
    const b = bladeData[i];

    const sway = Math.sin(elapsedTime * b.speed + b.phase) * b.amp;

  
    const totalSway = sway + windStrength;

    
    dummy.position.set(b.x, b.y, b.z);
    dummy.rotation.x = Math.PI / 2;  
    dummy.rotation.z = totalSway;  
    dummy.updateMatrix();

    blades.setMatrixAt(i, dummy.matrix);
  }
}
