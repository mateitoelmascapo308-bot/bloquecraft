import * as THREE from 'three';
import { BEDROCK_Y } from '../world/terrain.js';

export function createPlayer({ world, camera }) {
  const position = new THREE.Vector3(0, world.heightAt(0, 0) + 3, 0);
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const move = new THREE.Vector3();
  let verticalSpeed = 0;
  let onGround = false;
  let fallStartY = null;

  function resetPosition() {
    position.set(0, world.heightAt(0, 0) + 4, 0);
    verticalSpeed = 0;
    onGround = false;
    fallStartY = null;
    world.updateChunks(position.x, position.z);
  }

  function jump() {
    if (!onGround) return;
    verticalSpeed = 8;
    fallStartY = position.y;
    onGround = false;
  }

  function collides(px, py, pz) {
    const minX = Math.floor(px - 0.8), maxX = Math.ceil(px + 0.8);
    const minZ = Math.floor(pz - 0.8), maxZ = Math.ceil(pz + 0.8);
    const minY = Math.floor(py - 2.15), maxY = Math.ceil(py + 0.6);
    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (Math.abs(x - px) >= 0.8 || Math.abs(z - pz) >= 0.8) continue;
        for (let y = minY; y <= maxY; y++) {
          if (py - 1.65 < y + 0.5 && py + 0.1 > y - 0.5 && world.getBlock(x, y, z)) return true;
        }
      }
    }
    return false;
  }

  function movePlayer(dt, { forwardInput, sideInput }) {
    if (![position.x, position.y, position.z, camera.rotation.y].every(Number.isFinite)) {
      resetPosition();
      camera.rotation.set(0, 0, 0);
    }

    forward.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
    right.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
    move.copy(forward).multiplyScalar(forwardInput).addScaledVector(right, sideInput);
    const moving = move.lengthSq() > 0;
    if (moving) move.normalize();
    const dx = move.x * 5.3 * dt, dz = move.z * 5.3 * dt;
    const previousX = position.x, previousZ = position.z;
    if (!collides(position.x + dx, position.y, position.z)) position.x += dx;
    if (!collides(position.x, position.y, position.z + dz)) position.z += dz;
    world.updateChunks(position.x, position.z);

    const wasGrounded = onGround;
    if (wasGrounded && verticalSpeed <= 0 && !collides(position.x, position.y - 0.08, position.z)) {
      fallStartY ??= position.y;
    }
    verticalSpeed -= 22 * dt;
    const nextY = position.y + verticalSpeed * dt;
    let fallDistance = 0;
    if (verticalSpeed <= 0 && collides(position.x, nextY - 0.08, position.z)) {
      verticalSpeed = 0;
      onGround = true;
      if (!wasGrounded && fallStartY !== null) {
        fallDistance = fallStartY - position.y;
        fallStartY = null;
      }
    } else {
      onGround = false;
      position.y = nextY;
      if (verticalSpeed < 0) fallStartY ??= position.y;
    }
    const distance = Math.hypot(position.x - previousX, position.z - previousZ);
    return { moving, fallDistance, onGround, distance };
  }

  return {
    position,
    jump,
    move: movePlayer,
    resetPosition,
    get belowWorld() { return position.y < BEDROCK_Y - 10; },
  };
}
