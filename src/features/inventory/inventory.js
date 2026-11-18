export const HOTBAR_SIZE = 9;
export const INVENTORY_SIZE = 36;
const STACK_LIMIT = 64;

export function createInventory() {
  let slots = Array(INVENTORY_SIZE).fill(null);
  let selection = 0;
  const listeners = new Set();

  function notify() {
    for (const listener of listeners) listener();
  }

  function select(index) {
    selection = (index % HOTBAR_SIZE + HOTBAR_SIZE) % HOTBAR_SIZE;
    notify();
  }

  function swapWithSelected(index) {
    [slots[selection], slots[index]] = [slots[index], slots[selection]];
    notify();
  }

  function amountOf(type) {
    return slots.reduce((total, stack) => total + (stack?.type === type ? stack.count : 0), 0);
  }

  function removeFromSlot(source, index, count) {
    const stack = source[index];
    stack.count -= count;
    if (!stack.count) source[index] = null;
  }

  function insertInto(source, type, count) {
    while (count > 0) {
      const stack = source.find(slot => slot?.type === type && slot.count < STACK_LIMIT);
      if (stack) {
        const added = Math.min(count, STACK_LIMIT - stack.count);
        stack.count += added;
        count -= added;
        continue;
      }
      const empty = source.indexOf(null);
      if (empty === -1) return false;
      const added = Math.min(count, STACK_LIMIT);
      source[empty] = { type, count: added };
      count -= added;
    }
    return true;
  }

  function exchange(ingredients, output) {
    const required = Object.entries(ingredients);
    if (required.some(([type, count]) => amountOf(type) < count)) return 'missing-ingredients';
    const next = slots.map(stack => stack && { ...stack });
    for (const [type, requiredCount] of required) {
      let remaining = requiredCount;
      for (let i = 0; i < next.length && remaining > 0; i++) {
        if (next[i]?.type !== type) continue;
        const used = Math.min(remaining, next[i].count);
        removeFromSlot(next, i, used);
        remaining -= used;
      }
    }
    if (!insertInto(next, output.type, output.count)) return 'inventory-full';
    slots = next;
    notify();
    return 'success';
  }

  function consumeSelected() {
    if (!slots[selection]) return;
    removeFromSlot(slots, selection, 1);
    notify();
  }

  return {
    select,
    swapWithSelected,
    amountOf,
    exchange,
    consumeSelected,
    add: (type, count = 1) => exchange({}, { type, count }) === 'success',
    getSlot: index => slots[index] && { ...slots[index] },
    get selectedIndex() { return selection; },
    get selectedType() { return slots[selection]?.type; },
    subscribe(listener) { listeners.add(listener); },
  };
}
