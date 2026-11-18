export const CHUNK_SIZE = 16;
export const BEDROCK_Y = -32;
export const SEA_LEVEL = 2;
const WORLD_SEED = 73129;

function hash2(x, z) {
  let n = (Math.imul(x | 0, 374761393) + Math.imul(z | 0, 668265263) + WORLD_SEED) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function noise2(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = smooth(x - ix), fz = smooth(z - iz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  const ab = a + (b - a) * fx, cd = c + (d - c) * fx;
  return ab + (cd - ab) * fz;
}

function fbm(x, z, octaves) {
  let value = 0, amplitude = 0.5, total = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise2(x, z) * amplitude;
    total += amplitude;
    x *= 2;
    z *= 2;
    amplitude *= 0.5;
  }
  return value / total;
}

export function heightAt(x, z) {
  const broad = fbm(x * 0.035, z * 0.035, 4);
  const detail = fbm(x * 0.11 + 37, z * 0.11 - 19, 3);
  return Math.max(BEDROCK_Y + 1, Math.min(15, Math.floor(4 + (broad - 0.5) * 22 + (detail - 0.5) * 5)));
}

export function generateTerrain(cx, cz, addBlock) {
  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const x = cx * CHUNK_SIZE + lx, z = cz * CHUNK_SIZE + lz;
      const height = heightAt(x, z);
      for (let y = BEDROCK_Y; y <= height; y++) {
        let type = y < height - 3 ? 'stone' : 'dirt';
        if (y === BEDROCK_Y) type = 'bedrock';
        else if (y === height) type = height <= SEA_LEVEL + 2 ? 'sand' : 'grass';
        addBlock(x, y, z, type);
      }

      const nearEdge = lx < 2 || lx >= CHUNK_SIZE - 2 || lz < 2 || lz >= CHUNK_SIZE - 2;
      if (nearEdge || x * x + z * z < 64 || hash2(x + 700, z - 300) < 0.989 || height <= SEA_LEVEL + 1) continue;
      const base = height + 1;
      for (let y = 0; y < 4; y++) addBlock(x, base + y, z, 'wood');
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          for (let dy = 2; dy <= 4; dy++) {
            if (Math.abs(dx) + Math.abs(dz) + Math.max(0, dy - 3) > 4 && dx * dx + dz * dz > 1) continue;
            addBlock(x + dx, base + dy, z + dz, 'leaves');
          }
        }
      }
    }
  }
}
