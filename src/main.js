import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, HemisphereLight, DirectionalLight, PointLight, PCFSoftShadowMap } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer, Clock, LoopOnce } from 'three';

function initThreeJS() {
  // Canvas
  const canvas = document.querySelector('canvas.webgl');

  // Scene
  const scene = new Scene();

  // Camera
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2.825, 4.5);
  scene.add(camera);

  // Lights
  const ambientLight = new AmbientLight(0xffffff, 0.8); // Increased intensity
  scene.add(ambientLight);

  const hemisphereLight = new HemisphereLight(0x606060, 0x404040, 0.7); // Increased intensity
  scene.add(hemisphereLight);

  const directionalLight1 = new DirectionalLight(0xffffff, 2.0); // Increased intensity
  directionalLight1.position.set(5, 5, 5);
  directionalLight1.castShadow = true;
  directionalLight1.shadow.mapSize.width = 1024;  // Reduced shadow map size
  directionalLight1.shadow.mapSize.height = 1024;
  directionalLight1.shadow.camera.near = 0.1;
  directionalLight1.shadow.camera.far = 50;
  scene.add(directionalLight1);

  const directionalLight2 = new DirectionalLight(0xffffff, 1.2); // Increased intensity
  directionalLight2.position.set(-5, 5, 5);
  scene.add(directionalLight2);

  const pointLight = new PointLight(0xffffff, 1.5, 50); // New point light for additional lighting
  pointLight.position.set(0, 5, 5);
  scene.add(pointLight);

  // Renderer
  const renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  // Load model
  const loader = new GLTFLoader();
  let model, mixer, action, clock;

  loader.load(
    'https://raw.githubusercontent.com/brice913/finalthree/main/lastavatar30.glb',
    function (gltf) {
      model = gltf.scene;
      model.scale.set(2.5, 2.5, 2.5);
      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.needsUpdate = true;
          child.material.roughness = 0.6;
          child.material.metalness = 0.5;
        }
      });
      scene.add(model);

      // Animation
      mixer = new AnimationMixer(model);
      const clips = gltf.animations;
      if (clips.length > 0) {
        action = mixer.clipAction(clips[0]);
        action.timeScale = 0.5;
        action.setLoop(LoopOnce);
        action.clampWhenFinished = true;
        action.play();
      }

      // Clock
      clock = new Clock();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  // Resize handling
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scaleFactor = Math.min(width / 800, height / 600);
    if (model) {
      model.scale.set(scaleFactor * 2.5, scaleFactor * 2.5, scaleFactor * 2.5);
    }
    camera.position.set(0, scaleFactor * 2.825, scaleFactor * 4.5);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
  }
  animate();
}

// Make initThreeJS function globally available
window.initThreeJS = initThreeJS;
