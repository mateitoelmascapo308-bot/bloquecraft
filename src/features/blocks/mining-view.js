export function createMiningView({ bar, fill, label }) {
  return function renderProgress(state) {
    bar.style.display = state ? 'block' : 'none';
    fill.style.transform = `scaleX(${state?.progress ?? 0})`;
    if (state) label.textContent = `Picando ${state.name}`;
  };
}
