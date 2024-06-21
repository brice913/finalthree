import "./styles/style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { AnimationMixer } from "three/src/animation/AnimationMixer.js";
console.log(THREE);

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
camera.position.set(0, 2.5, 5); // Move the camera up by 50% (originally 5 units up)
scene.add(camera);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Increased intensity
scene.add(ambientLight);

// Directional Lights
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight1.position.set(5, 5, 5);
directionalLight1.castShadow = true; // Enable shadows
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(-5, 5, 5);
scene.add(directionalLight2);

// Spotlights for better illumination
const spotLight1 = new THREE.SpotLight(0xffffff, 2);
spotLight1.position.set(0, 10, 0); // Light from above
spotLight1.angle = Math.PI / 6;
spotLight1.penumbra = 0.1;
spotLight1.castShadow = true;
scene.add(spotLight1);

const spotLight2 = new THREE.SpotLight(0xffffff, 1);
spotLight2.position.set(5, 5, 5);
spotLight2.angle = Math.PI / 6;
spotLight2.penumbra = 0.1;
spotLight2.castShadow = true;
scene.add(spotLight2);

// Additional lights for more fill
const pointLight1 = new THREE.PointLight(0xffffff, 1);
pointLight1.position.set(-5, -5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.set(5, -5, 5);
scene.add(pointLight2);

// Enable shadows in the renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, // Enable transparency
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0); // Set background to transparent
renderer.shadowMap.enabled = true; // Enable shadow maps
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows

// Handling window resize
window.addEventListener("resize", () => {
  // Update camera aspect ratio and renderer size
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});

// Loading model and animation
const loader = new GLTFLoader();
let model, mixer;

loader.load(
  "https://raw.githubusercontent.com/brice913/threejswebflow/main/animationdance.glb", // Updated URL
  function (gltf) {
    model = gltf.scene;
    model.scale.set(2.7, 2.7, 2.7); // Scale the model to be 2.5 times bigger
    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.needsUpdate = true; // Ensure material updates for better quality
        child.material.roughness = 0.5; // Adjust roughness for better appearance
        child.material.metalness = 0.5; // Adjust metalness for better appearance
      }
    });
    scene.add(model);

    // Set up the animation mixer
    mixer = new AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.timeScale = 0.5; // Slow down the animation speed by half (2x slower)
      action.play();
    });
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Animate function
function animate() {
  requestAnimationFrame(animate);

  // Update the animation mixer
  if (mixer) mixer.update(0.01);

  renderer.render(scene, camera);
}
animate();
