import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { AnimationMixer } from "three/src/animation/AnimationMixer.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2.825, 4.5);
scene.add(camera);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Hemisphere Light
const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040, 0.5);
scene.add(hemisphereLight);

// Directional Lights
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight1.position.set(5, 5, 5);
directionalLight1.castShadow = true;
directionalLight1.shadow.mapSize.width = 2048;
directionalLight1.shadow.mapSize.height = 2048;
directionalLight1.shadow.camera.near = 0.1;
directionalLight1.shadow.camera.far = 50;
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight2.position.set(-5, 5, 5);
scene.add(directionalLight2);

// Spotlights for better illumination
const spotLight1 = new THREE.SpotLight(0xffffff, 1.5);
spotLight1.position.set(0, 10, 0);
spotLight1.angle = Math.PI / 6;
spotLight1.penumbra = 0.1;
spotLight1.castShadow = true;
spotLight1.shadow.mapSize.width = 2048;
spotLight1.shadow.mapSize.height = 2048;
spotLight1.shadow.camera.near = 0.1;
spotLight1.shadow.camera.far = 50;
scene.add(spotLight1);

const spotLight2 = new THREE.SpotLight(0xffffff, 1);
spotLight2.position.set(5, 5, 5);
spotLight2.angle = Math.PI / 6;
spotLight2.penumbra = 0.1;
spotLight2.castShadow = true;
spotLight2.shadow.mapSize.width = 2048;
spotLight2.shadow.mapSize.height = 2048;
spotLight2.shadow.camera.near = 0.1;
spotLight2.shadow.camera.far = 50;
scene.add(spotLight2);

// Additional lights for more fill
const pointLight1 = new THREE.PointLight(0xffffff, 0.5);
pointLight1.position.set(-5, -5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
pointLight2.position.set(5, -5, 5);
scene.add(pointLight2);

// Subtle red light for the face
const redLight = new THREE.PointLight(0xff0000, 0.3);
redLight.position.set(0, 2.5, 3);
scene.add(redLight);

// Enable shadows in the renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true, // Enable antialiasing for smoother edges
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Loading model and animation
const loader = new GLTFLoader();
let model, mixer, action, clock;

loader.load(
  "https://raw.githubusercontent.com/brice913/finalthree/main/perfectavatar3.glb",
  function (gltf) {
    model = gltf.scene;
    model.scale.set(2.5, 2.5, 2.5);
    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.needsUpdate = true;
        child.material.roughness = 0.6; // Balanced roughness
        child.material.metalness = 0.5; // Balanced metalness
      }
    });
    scene.add(model);

    // Set up the animation mixer
    mixer = new AnimationMixer(model);
    const clips = gltf.animations;
    if (clips.length > 0) {
      action = mixer.clipAction(clips[0]);
      action.timeScale = 0.5; // Slow down the animation speed by half (2x slower)
      action.setLoop(THREE.LoopOnce); // Play animation only once
      action.clampWhenFinished = true; // Keep the last frame when animation finishes
      action.play();
    }

    // Create a clock for animation and camera rotation timing
    clock = new THREE.Clock();
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Handling window resize
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Adjust the model's scale and camera position based on the window size
  const scaleFactor = Math.min(width / 800, height / 600);
  if (model) {
    model.scale.set(scaleFactor * 2.5, scaleFactor * 2.5, scaleFactor * 2.5);
  }
  camera.position.set(0, scaleFactor * 2.825, scaleFactor * 4.5);
});

// Function to start animation
function startAnimation() {
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(startAnimation);
}

// GSAP ScrollTrigger to start animation when in view
ScrollTrigger.create({
  trigger: ".work-wrap-3D",
  start: "top 80%",
  end: "bottom 20%",
  onEnter: () => {
    startAnimation();
  }
});
