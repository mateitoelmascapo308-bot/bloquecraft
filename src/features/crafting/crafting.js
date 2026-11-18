import { items } from '../../shared/items.js';
import { recipes } from './recipes.js';

export function mountCrafting({ list, inventory, toast }) {
  function render() {
    list.innerHTML = recipes.map((recipe, index) => {
      const ingredients = Object.entries(recipe.ingredients).map(([type, required]) => ({
        type,
        required,
        available: inventory.amountOf(type),
      }));
      const needs = ingredients.map(({ type, required, available }) =>
        `${items[type]?.name ?? type} ${available}/${required}`).join(' · ');
      const disabled = ingredients.some(({ required, available }) => available < required);
      return `<button type="button" data-recipe="${index}" ${disabled ? 'disabled' : ''}>${recipe.icon} ${recipe.name}<span>${needs}</span></button>`;
    }).join('');
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-recipe]');
    if (!button) return;
    const recipe = recipes[Number(button.dataset.recipe)];
    const result = inventory.exchange(recipe.ingredients, recipe);
    if (result === 'missing-ingredients') toast('Faltan materiales');
    else if (result === 'inventory-full') toast('Inventario lleno');
    else toast(`Creaste ${recipe.name}`);
  });

  inventory.subscribe(render);
  render();
}
