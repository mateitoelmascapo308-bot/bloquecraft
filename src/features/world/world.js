import { isBlock } from '../../shared/items.js';
import { CHUNK_SIZE, generateTerrain, heightAt } from './terrain.js';

const LOAD_RADIUS = 1;
const chunkCoord = position => Math.floor(position / CHUNK_SIZE);
const chunkKey = (cx, cz) => `${cx},${cz}`;
export const blockKey = (x, y, z) => `${x},${y},${z}`;

export function createWorld() {
  const chunks = new Map();
  const editsByChunk = new Map();
  let revision = 0;
  let centerX, centerZ;

  function loadChunk(cx, cz, key) {
    const blocks = new Map();
    generateTerrain(cx, cz, (x, y, z, type) => {
      const id = blockKey(x, y, z);
      if (!blocks.has(id)) blocks.set(id, { x, y, z, type });
    });
    for (const [id, block] of editsByChunk.get(key) ?? []) {
      if (block) blocks.set(id, block);
      else blocks.delete(id);
    }
    chunks.set(key, blocks);
  }

  function updateChunks(x, z) {
    const cx = chunkCoord(x), cz = chunkCoord(z);
    if (cx === centerX && cz === centerZ) return;
    centerX = cx;
    centerZ = cz;

    const required = new Set();
    for (let dx = -LOAD_RADIUS; dx <= LOAD_RADIUS; dx++) {
      for (let dz = -LOAD_RADIUS; dz <= LOAD_RADIUS; dz++) {
        const key = chunkKey(cx + dx, cz + dz);
        required.add(key);
        if (!chunks.has(key)) loadChunk(cx + dx, cz + dz, key);
      }
    }
    for (const key of chunks.keys()) {
      if (!required.has(key)) chunks.delete(key);
    }
    revision++;
  }

  function getBlock(x, y, z) {
    return chunks.get(chunkKey(chunkCoord(x), chunkCoord(z)))?.get(blockKey(x, y, z));
  }

  function editBlock(x, y, z, type) {
    const key = chunkKey(chunkCoord(x), chunkCoord(z));
    const chunk = chunks.get(key);
    if (!chunk) return false;

    const id = blockKey(x, y, z);
    const previous = chunk.get(id);
    if (type === null ? !previous || previous.type === 'bedrock' : previous) return false;

    const block = type === null ? null : { x, y, z, type };
    if (!editsByChunk.has(key)) editsByChunk.set(key, new Map());
    editsByChunk.get(key).set(id, block);
    if (block) chunk.set(id, block);
    else chunk.delete(id);
    revision++;
    return true;
  }

  function* loadedBlocks() {
    for (const chunk of chunks.values()) yield* chunk.values();
  }

  return {
    heightAt,
    updateChunks,
    getBlock,
    loadedBlocks,
    placeBlock: (x, y, z, type) => isBlock(type) && type !== 'bedrock' && editBlock(x, y, z, type),
    removeBlock: (x, y, z) => editBlock(x, y, z, null),
    get revision() { return revision; },
  };
}
