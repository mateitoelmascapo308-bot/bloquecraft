import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorld } from '../src/features/world/world.js';
import { BEDROCK_Y, CHUNK_SIZE } from '../src/features/world/terrain.js';
import { createInventory, INVENTORY_SIZE } from '../src/features/inventory/inventory.js';
import { recipes } from '../src/features/crafting/recipes.js';
import { createSurvival } from '../src/features/survival/survival.js';
import { createBlockInteractions } from '../src/features/blocks/block-interactions.js';
import { createFootsteps } from '../src/features/footsteps/footsteps.js';

test('chunk reload preserves replacements, removals and new placements', () => {
  const world = createWorld();
  world.updateChunks(0, 0);
  const y = world.heightAt(0, 0);
  const adjacentY = world.heightAt(-1, 0);
  assert.equal(world.getBlock(0, y, 0).type, 'grass');
  assert.equal(world.removeBlock(0, BEDROCK_Y, 0), false);
  assert.equal(world.removeBlock(0, y, 0), true);
  assert.equal(world.placeBlock(0, y, 0, 'planks'), true);
  assert.equal(world.removeBlock(-1, adjacentY, 0), true);
  assert.equal(world.placeBlock(0, y + 1, 0, 'crafting_table'), true);
  world.updateChunks(-4 * CHUNK_SIZE, 0);
  assert.equal(world.getBlock(0, y, 0), undefined);
  world.updateChunks(0, 0);
  assert.equal(world.getBlock(0, y, 0).type, 'planks');
  assert.equal(world.getBlock(-1, adjacentY, 0), undefined);
  assert.equal(world.getBlock(0, y + 1, 0).type, 'crafting_table');
});

test('inventory keeps stack limits and can swap into the selected slot', () => {
  const inventory = createInventory();
  assert.equal(inventory.add('stone', 65), true);
  assert.deepEqual(inventory.getSlot(0), { type: 'stone', count: 64 });
  assert.deepEqual(inventory.getSlot(1), { type: 'stone', count: 1 });
  inventory.select(-1);
  assert.equal(inventory.selectedIndex, 8);
  inventory.swapWithSelected(1);
  assert.equal(inventory.selectedType, 'stone');
  inventory.consumeSelected();
  assert.equal(inventory.selectedType, undefined);
  assert.equal(inventory.amountOf('stone'), 64);
});

test('crafting keeps ingredients if the output does not fit', () => {
  const recipe = recipes.find(({ type }) => type === 'planks');
  const inventory = createInventory();
  inventory.add('wood', 64);
  inventory.add('stone', (INVENTORY_SIZE - 1) * 64);
  assert.equal(inventory.exchange(recipe.ingredients, recipe), 'inventory-full');
  assert.equal(inventory.amountOf('wood'), 64);
  assert.equal(inventory.amountOf('planks'), 0);

  const anotherInventory = createInventory();
  anotherInventory.add('wood');
  anotherInventory.add('stone', (INVENTORY_SIZE - 1) * 64);
  assert.equal(anotherInventory.exchange(recipe.ingredients, recipe), 'success');
  assert.equal(anotherInventory.amountOf('wood'), 0);
  assert.equal(anotherInventory.amountOf('planks'), 4);
});

test('mining respects tools and placement consumes the selected material', () => {
  const world = createWorld();
  world.updateChunks(0, 0);
  const y = BEDROCK_Y + 1;
  let hitY = y;
  const inventory = createInventory();
  inventory.add('stone_pickaxe');
  const interactions = createBlockInteractions({
    world, inventory, position: { x: 4, y: 10, z: 4 },
    targetBlock: () => ({ block: world.getBlock(0, hitY, 0), normal: { x: 0, y: 1, z: 0 } }),
    progressView() {},
    toast() {},
  });
  interactions.startMining();
  interactions.update(0.5);
  assert.equal(world.getBlock(0, y, 0).type, 'stone');
  interactions.update(0.05);
  assert.equal(inventory.amountOf('stone'), 1);
  assert.equal(world.getBlock(0, y, 0), undefined);
  hitY = BEDROCK_Y;
  inventory.select(1);
  interactions.placeSelected();
  assert.equal(world.getBlock(0, y, 0).type, 'stone');
  assert.equal(inventory.amountOf('stone'), 0);
});

test('survival applies hunger, starvation, fall damage and respawn', () => {
  let stats;
  let respawns = 0;
  const survival = createSurvival({
    renderStats: value => { stats = value; },
    respawn: () => { respawns++; },
    toast() {},
  });
  assert.deepEqual(stats, { health: 20, hunger: 20 });
  survival.update(1, { moving: false, fallDistance: 8 });
  assert.equal(stats.health, 15);
  for (let i = 0; i < 20; i++) survival.update(45, { moving: true, fallDistance: 0 });
  assert.deepEqual(stats, { health: 14, hunger: 0 });
  survival.update(8, { moving: false, fallDistance: 0 });
  assert.equal(stats.health, 13);
  survival.update(1, { moving: false, fallDistance: 20 });
  assert.equal(respawns, 1);
  assert.deepEqual(stats, { health: 20, hunger: 10 });
});

test('footsteps use the surface and require grounded movement', () => {
  const world = createWorld();
  world.updateChunks(0, 0);
  world.placeBlock(0, 20, 0, 'planks');
  world.placeBlock(1, 20, 0, 'stone');
  const sounds = [];
  const footsteps = createFootsteps({ world, play: surface => sounds.push(surface) });
  const position = { x: 0, y: 22.15, z: 0 };
  const walking = { onGround: true, distance: 0.1 };

  footsteps.update(0.22, walking, position);
  footsteps.update(1, { onGround: true, distance: 0 }, position);
  assert.deepEqual(sounds, []);
  footsteps.update(0.22, walking, position);
  assert.deepEqual(sounds, ['planks']);

  position.x = 1;
  footsteps.update(0.22, walking, position);
  footsteps.update(1, { onGround: false, distance: 0.1 }, position);
  footsteps.update(0.22, walking, position);
  assert.deepEqual(sounds, ['planks']);
  footsteps.update(0.22, walking, position);
  assert.deepEqual(sounds, ['planks', 'stone']);
});
