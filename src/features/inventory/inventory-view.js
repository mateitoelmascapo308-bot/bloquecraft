import { items } from '../../shared/items.js';
import { HOTBAR_SIZE, INVENTORY_SIZE } from './inventory.js';

export function mountInventoryView({ bar, grid, inventory }) {
  const elements = Array.from({ length: INVENTORY_SIZE }, (_, index) => {
    const element = document.createElement('div');
    const isHotbar = index < HOTBAR_SIZE;
    element.className = isHotbar ? 'slot' : 'inv-slot';
    if (isHotbar) bar.appendChild(element);
    else {
      grid.appendChild(element);
      element.addEventListener('click', () => inventory.swapWithSelected(index));
    }
    return element;
  });

  function render() {
    elements.forEach((element, index) => {
      const stack = inventory.getSlot(index);
      const item = stack && items[stack.type];
      const isHotbar = index < HOTBAR_SIZE;
      const key = isHotbar ? `<span class="slot-key">${index + 1}</span>` : '';
      const count = stack ? `<span class="slot-count">${stack.count}</span>` : '';
      element.classList.toggle('active', index === inventory.selectedIndex);
      element.innerHTML = `${key}${item?.icon ?? ''}${count}`;
      const emptyTitle = isHotbar ? `Ranura ${index + 1} vacía` : 'Ranura vacía';
      element.title = stack ? `${item.name}: ${stack.count}` : emptyTitle;
    });
  }

  inventory.subscribe(render);
  render();
}
