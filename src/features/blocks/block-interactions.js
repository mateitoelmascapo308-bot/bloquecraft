import { items, isBlock } from '../../shared/items.js';
import { blockKey } from '../world/world.js';

const miningDurations = {
  grass: 0.55, dirt: 0.5, stone: 1.35, wood: 0.9,
  leaves: 0.28, sand: 0.45, planks: 0.65, crafting_table: 0.8,
};
const toolBoosts = {
  wooden_pickaxe: { multiplier: 2, types: ['wood', 'planks', 'crafting_table'] },
  stone_pickaxe: { multiplier: 2.5, types: ['stone', 'sand', 'grass', 'dirt'] },
};

export function createBlockInteractions({ world, targetBlock, inventory, position, progressView, toast }) {
  let mining = false;
  let targetKey;
  let progress = 0;

  function clearProgress() {
    targetKey = undefined;
    progress = 0;
    progressView(null);
  }

  function stopMining() {
    mining = false;
    clearProgress();
  }

  function startMining() {
    if (targetBlock()?.block.type === 'bedrock') {
      toast('La bedrock no se puede picar');
      return;
    }
    mining = true;
  }

  function update(dt) {
    if (!mining) return;
    const block = targetBlock()?.block;
    if (!block || block.type === 'bedrock') {
      clearProgress();
      return;
    }
    const key = blockKey(block.x, block.y, block.z);
    if (key !== targetKey) {
      targetKey = key;
      progress = 0;
    }
    const tool = toolBoosts[inventory.selectedType];
    const speed = tool?.types.includes(block.type) ? tool.multiplier : 1;
    const name = items[block.type]?.name ?? 'Bloque';
    progress = Math.min(1, progress + dt * speed / (miningDurations[block.type] ?? 0.7));
    progressView({ name, progress });
    if (progress < 1) return;

    if (inventory.add(block.type)) {
      world.removeBlock(block.x, block.y, block.z);
      toast(`${name} guardado`);
    } else toast('Inventario lleno');
    stopMining();
  }

  function placeSelected() {
    const hit = targetBlock();
    if (!hit) return;
    const { block, normal } = hit;
    const x = Math.round(block.x + normal.x), y = Math.round(block.y + normal.y);
    const z = Math.round(block.z + normal.z);
    const type = inventory.selectedType;
    if (!type) return toast('Esa ranura está vacía');
    if (!isBlock(type)) return toast('Ese objeto no se puede colocar');
    if (world.getBlock(x, y, z)) return toast('Hay un bloque ahí');
    if (Math.abs(x - position.x) < 0.8 && Math.abs(z - position.z) < 0.8 &&
        y >= position.y - 1.7 && y <= position.y + 0.2) return toast('No puedes colocarlo ahí');
    if (world.placeBlock(x, y, z, type)) inventory.consumeSelected();
  }

  return { startMining, stopMining, placeSelected, update };
}
