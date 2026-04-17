import * as THREE from 'three';

export function initScene(container: HTMLElement) {
  const scene = new THREE.Scene();
  // Optional: add slight fog for depth
  scene.fog = new THREE.FogExp2('#0d0f12', 0.05);

  const camera = new THREE.PerspectiveCamera(
    45, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    100
  );
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  container.appendChild(renderer.domElement);

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  });

  return { scene, camera, renderer };
}
