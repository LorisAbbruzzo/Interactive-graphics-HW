import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { player, initializePlayer, playerState } from "./components/Player";
import { animateVehicles } from "./animateVehicles";
import { map, initializeMap } from "./components/Map";
import { animatePlayer } from "./animatePlayer";
import { animateLogs } from "./animateLogs";
import { hitTest } from "./hitTest";
import { animateGrass } from './animateGrass.js';
import { animateRiver } from "./animateRiver";
import { grassRows, riverRows } from './components/Map';
import { initializeWorldCycle, updateWorldCycle } from './utilities/worldCycle.js';
import "./collectUserInput";
import "./style.css";

const scene = new THREE.Scene();
scene.add(player);
scene.add(map);

const camera = Camera();
player.add(camera);

const renderer = Renderer();
const scoreDOM = document.getElementById("score");
const resultDOM = document.getElementById("result-container");

initializeGame();

document.querySelector("#retry")?.addEventListener("click", initializeGame);

function initializeGame() {
    initializePlayer();
    initializeMap();
    initializeWorldCycle(scene);

    if (scoreDOM) scoreDOM.innerText = "0";
    if (resultDOM) resultDOM.style.visibility = "hidden";
}

function onWindowResize() {
    const size = 300;
    const viewRatio = window.innerWidth / window.innerHeight;
    const width = viewRatio < 1 ? size : size * viewRatio;
    const height = viewRatio < 1 ? size / viewRatio : size;

    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

renderer.setAnimationLoop(animate);

const clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;

    animateVehicles();
    animatePlayer();
    animateLogs();
    hitTest();
    updateWorldCycle(delta, player, scene);

    for (const row of grassRows) animateGrass(row, elapsed);
    renderer.render(scene, camera);
}
