import { createEngine } from './core/engine.js';
import { mountHud } from './core/hud.js';
import { bindInput } from './core/input.js';
import { createWorld } from './features/world/world.js';
import { createWorldView } from './features/world/world-view.js';
import { createPlayer } from './features/player/player.js';
import { createPlayerView } from './features/player/player-view.js';
import { createInventory } from './features/inventory/inventory.js';
import { mountInventoryView } from './features/inventory/inventory-view.js';
import { mountCrafting } from './features/crafting/crafting.js';
import { createSurvival } from './features/survival/survival.js';
import { createSurvivalView } from './features/survival/survival-view.js';
import { createBlockInteractions } from './features/blocks/block-interactions.js';
import { createMiningView } from './features/blocks/mining-view.js';
import { createFootsteps } from './features/footsteps/footsteps.js';
import { createFootstepAudio } from './features/footsteps/footstep-audio.js';

const byId = id => document.getElementById(id);
const engine = createEngine();
const { scene, camera, controls } = engine;
const footstepAudio = createFootstepAudio();
const { showPosition, toggleInventory, toast } = mountHud({
  controls,
  overlay: byId('overlay'),
  inventoryPanel: byId('inventory-panel'),
  start: byId('start'),
  resume: byId('resume-game'),
  toastElement: byId('toast'),
  coords: byId('coords'),
  onPlay: footstepAudio.prepare,
});

const world = createWorld();
world.updateChunks(0, 0);
const worldView = createWorldView({ scene, camera, world });
const player = createPlayer({ world, camera });
const playerView = createPlayerView({ scene, camera, position: player.position });
const footsteps = createFootsteps({ world, play: footstepAudio.play });

const inventory = createInventory();
mountInventoryView({ bar: byId('hotbar'), grid: byId('inventory-grid'), inventory });
mountCrafting({ list: byId('recipe-list'), inventory, toast });
const renderStats = createSurvivalView({ healthBar: byId('health-bar'), hungerBar: byId('hunger-bar') });
const survival = createSurvival({ renderStats, respawn: player.resetPosition, toast });
const progressView = createMiningView({
  bar: byId('mine-progress'),
  fill: byId('mine-fill'),
  label: byId('mine-label'),
});
const blocks = createBlockInteractions({
  world,
  targetBlock: worldView.targetBlock,
  inventory,
  position: player.position,
  progressView,
  toast,
});

const movementInput = bindInput({
  controls,
  toggleInventory,
  togglePerspective: () => toast(playerView.togglePerspective()
    ? 'Vista en tercera persona' : 'Vista en primera persona'),
  selectSlot: inventory.select,
  cycleSlot: step => inventory.select(inventory.selectedIndex + step),
  jump: player.jump,
  startMining: blocks.startMining,
  stopMining: blocks.stopMining,
  placeSelected: blocks.placeSelected,
});

engine.start(dt => {
  if (controls.isLocked) {
    const movement = player.move(dt, movementInput());
    footsteps.update(dt, movement, player.position);
    survival.update(dt, movement);
    if (player.belowWorld) {
      player.resetPosition();
      toast('Volviste al punto de inicio');
    }
    showPosition(player.position);
    blocks.update(dt);
  }
  playerView.render();
  worldView.render(player.position);
});
