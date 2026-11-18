const STEP_INTERVAL = 0.43;

function surfaceUnderPlayer(world, position) {
  const { x, y, z } = position;
  const baseY = Math.floor(y - 2.15);
  const centerX = Math.round(x), centerZ = Math.round(z);
  let surface = 'grass';
  let bestDistance = 0.8;

  for (let bx = centerX - 1; bx <= centerX + 1; bx++) {
    for (let bz = centerZ - 1; bz <= centerZ + 1; bz++) {
      for (let by = baseY - 1; by <= baseY + 1; by++) {
        const standingHeight = by + 2.15;
        if (standingHeight > y + 0.12) continue;
        const block = world.getBlock(bx, by, bz);
        if (!block) continue;
        const distance = Math.abs(y - standingHeight) + Math.hypot(x - bx, z - bz) * 0.2;
        if (distance >= bestDistance) continue;
        surface = block.type;
        bestDistance = distance;
      }
    }
  }
  return surface;
}

export function createFootsteps({ world, play }) {
  let elapsed = 0;

  function update(dt, { onGround, distance }, position) {
    if (!onGround) {
      elapsed = 0;
      return;
    }
    if (distance <= 0.001) return;
    elapsed += dt;
    if (elapsed < STEP_INTERVAL) return;
    elapsed = 0;
    play(surfaceUnderPlayer(world, position));
  }

  return { update };
}
