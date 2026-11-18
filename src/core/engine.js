import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

export function createEngine() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9bd4f5);
  scene.fog = new THREE.Fog(0x9bd4f5, 12, 30);
  const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xd8f1ff, 0x617044, 2));
  const sun = new THREE.DirectionalLight(0xfff2d2, 2.2);
  sun.position.set(-18, 30, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const controls = new PointerLockControls(camera, document.body);
  scene.add(camera);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  function start(frame) {
    let lastTime = performance.now();
    function animate(now) {
      requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      frame(dt);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }

  return { scene, camera, controls, start };
}
