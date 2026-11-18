import * as THREE from 'three';

export function createPlayerView({ scene, camera, position }) {
  const avatar = new THREE.Group();
  const shirt = new THREE.MeshLambertMaterial({ color: 0x3e78bd });
  const skin = new THREE.MeshLambertMaterial({ color: 0xe6b58e });
  const pants = new THREE.MeshLambertMaterial({ color: 0x35475e });
  const forward = new THREE.Vector3();

  function part(width, height, depth, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    avatar.add(mesh);
  }

  part(0.62, 0.78, 0.38, shirt, 0, 1.02, 0);
  part(0.44, 0.44, 0.44, skin, 0, 1.65, 0);
  part(0.25, 0.68, 0.3, pants, -0.17, 0.34, 0);
  part(0.25, 0.68, 0.3, pants, 0.17, 0.34, 0);
  part(0.22, 0.72, 0.28, skin, -0.44, 1.02, 0);
  part(0.22, 0.72, 0.28, skin, 0.44, 1.02, 0);
  avatar.visible = false;
  scene.add(avatar);

  function togglePerspective() {
    avatar.visible = !avatar.visible;
    return avatar.visible;
  }

  function render() {
    avatar.position.set(position.x, position.y - 1.65, position.z);
    avatar.rotation.y = Number.isFinite(camera.rotation.y) ? camera.rotation.y : 0;
    camera.position.copy(position);
    if (avatar.visible) {
      forward.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
      camera.position.addScaledVector(forward, -4);
      camera.position.y += 0.45;
    }
  }

  return { togglePerspective, render };
}
