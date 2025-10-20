import * as THREE from "three";

const CYCLE_DURATION_SECONDS = 300;

const COLORS = {
  night: {
    background: new THREE.Color(0x1a1a40),
    ambient: new THREE.Color(0x303050),    
    sun: new THREE.Color(0x99bbff),         
  },
  dawn: {
    background: new THREE.Color(0xff9966),
    ambient: new THREE.Color(0xffb380),
    sun: new THREE.Color(0xffcc99),
  },
  day: {
    background: new THREE.Color(0x87ceff),
    ambient: new THREE.Color(0xffffff),
    sun: new THREE.Color(0xfff7e0),
  },
  dusk: {
    background: new THREE.Color(0xff704d),
    ambient: new THREE.Color(0xff9966),
    sun: new THREE.Color(0xffaa66),
  },
};

let sunLight, ambientLight, moonLight;
const state = { progress: 0.2 }; 


export function initializeWorldCycle(scene) {
    state.progress = 0.2;
    if (sunLight) {
        scene.remove(sunLight);
        scene.remove(sunLight.target);
        sunLight.dispose?.();
    }
    if (ambientLight) {
        scene.remove(ambientLight);
        ambientLight.dispose?.();
    }
    if (moonLight) {
        scene.remove(moonLight);
        scene.remove(moonLight.target);
        moonLight.dispose?.();
    }
 
    ambientLight = new THREE.AmbientLight(COLORS.day.ambient, 0.6);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(COLORS.day.sun, 2.5);
    sunLight.castShadow = true;

    const d = 200; 
    Object.assign(sunLight.shadow.camera, {
        near: 10,
        far: 800,
        left: -d,
        right: d,
        top: d,
        bottom: -d,
    });
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    scene.add(sunLight.target);

    moonLight = new THREE.HemisphereLight(0x3344aa, 0x000000, 0.1);
    scene.add(moonLight);

    scene.background = COLORS.day.background.clone();
    const fogColor = scene.background.clone();
    scene.fog = new THREE.Fog(fogColor, 400, 1600);
}


export function updateWorldCycle(delta, player, scene) {

  state.progress = (state.progress + delta / CYCLE_DURATION_SECONDS) % 1;
  const angle = state.progress * Math.PI * 2;

 
  const playerPos = player.position;
  const distance = 500;
  const height = 300;

  const sunX = playerPos.x + Math.cos(angle) * distance;
  const sunY = playerPos.y + Math.sin(angle) * distance;
  const sunZ = playerPos.z + Math.sin(angle) * height;

  sunLight.position.set(sunX, sunY, sunZ);
  sunLight.target.position.copy(playerPos);

  
  const cam = sunLight.shadow.camera;
  const shadowRange = 200;
  Object.assign(cam, {
    left: -shadowRange,
    right: shadowRange,
    top: shadowRange,
    bottom: -shadowRange,
  });
  cam.updateProjectionMatrix();

  const DAWN_END = 0.10;
  const DAY_END = 0.65;
  const DUSK_END = 0.75;
  const NIGHT_END = 1.00;

  let from, to, lerp;
  if (state.progress < DAWN_END) {
    from = COLORS.night; to = COLORS.dawn;
    lerp = state.progress / DAWN_END;
  } else if (state.progress < DAY_END) {
    from = COLORS.dawn; to = COLORS.day;
    lerp = (state.progress - DAWN_END) / (DAY_END - DAWN_END);
  } else if (state.progress < DUSK_END) {
    from = COLORS.day; to = COLORS.dusk;
    lerp = (state.progress - DAY_END) / (DUSK_END - DAY_END);
  } else {
    from = COLORS.dusk; to = COLORS.night;
    lerp = (state.progress - DUSK_END) / (NIGHT_END - DUSK_END);
  }

  scene.background.copy(from.background).lerp(to.background, lerp);
  ambientLight.color.copy(from.ambient).lerp(to.ambient, lerp);
  sunLight.color.copy(from.sun).lerp(to.sun, lerp);

  const sunFactor = Math.max(0, Math.sin(angle));
  sunLight.intensity = 1 + sunFactor * 1.5; 
  ambientLight.intensity = 0.4 + sunFactor * 0.6;
  const sunUp = sunFactor > 0;
  sunLight.visible = sunUp;

  sunLight.intensity = sunUp ? sunFactor * 2.0 : 0;
  
  moonLight.intensity = 0.1 + (1 - sunFactor) * 0.2;
  moonLight.color.setHSL(0.65, 0.5, 0.6 + 0.2 * (1 - sunFactor));


  scene.fog.color.copy(scene.background);
  scene.fog.near = 300;
  scene.fog.far = 1600;
}
