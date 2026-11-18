export const items = {
  grass: { name: 'Césped', icon: '🌿', color: 0x66b447 },
  dirt: { name: 'Tierra', icon: '🟫', color: 0x8c5b38 },
  stone: { name: 'Piedra', icon: '🪨', color: 0x858b8e },
  wood: { name: 'Madera', icon: '🪵', color: 0x80512c },
  planks: { name: 'Tablones', icon: '🟫', color: 0xb9824d },
  stick: { name: 'Palos', icon: '🥢' },
  crafting_table: { name: 'Mesa de crafteo', icon: '🪚', color: 0x98643e },
  wooden_pickaxe: { name: 'Pico de madera', icon: '⛏️' },
  stone_pickaxe: { name: 'Pico de piedra', icon: '⚒️' },
  leaves: { name: 'Hojas', icon: '🍃', color: 0x378b3c },
  sand: { name: 'Arena', icon: '🟨', color: 0xd8c477 },
  bedrock: { name: 'Bedrock', color: 0x343638 },
};

export function isBlock(type) {
  return Object.hasOwn(items, type) && items[type].color !== undefined;
}
