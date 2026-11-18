import * as THREE from 'three';
import { items, isBlock } from '../../shared/items.js';
import { SEA_LEVEL } from './terrain.js';

export function createWorldView({ scene, camera, world }) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const materials = new Map(Object.entries(items)
    .filter(([type]) => isBlock(type))
    .map(([type, { color }]) => [type, new THREE.MeshLambertMaterial({ color })]));
  const transform = new THREE.Object3D();
  const ray = new THREE.Raycaster();
  ray.far = 6;
  const center = new THREE.Vector2();
  let meshes = [];
  let renderedRevision = -1;

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({ color: 0x369bc5, transparent: true, opacity: 0.82 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = SEA_LEVEL + 0.45;
  scene.add(water);

  function syncMeshes() {
    if (renderedRevision === world.revision) return;
    for (const mesh of meshes) {
      scene.remove(mesh);
      mesh.dispose();
    }
    meshes = [];
    const groups = new Map([...materials.keys()].map(type => [type, []]));
    for (const block of world.loadedBlocks()) groups.get(block.type).push(block);

    for (const [type, blocks] of groups) {
      if (!blocks.length) continue;
      const mesh = new THREE.InstancedMesh(geometry, materials.get(type), blocks.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      blocks.forEach((block, index) => {
        transform.position.set(block.x, block.y, block.z);
        transform.updateMatrix();
        mesh.setMatrixAt(index, transform.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.userData.blocks = blocks;
      scene.add(mesh);
      meshes.push(mesh);
    }
    renderedRevision = world.revision;
  }

  function targetBlock() {
    syncMeshes();
    ray.setFromCamera(center, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    if (!hit) return null;
    return { block: hit.object.userData.blocks[hit.instanceId], normal: hit.face.normal };
  }

  function render(position) {
    syncMeshes();
    water.position.x = position.x;
    water.position.z = position.z;
  }

  return { targetBlock, render };
}
