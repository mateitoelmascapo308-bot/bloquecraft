export function bindInput({ controls, toggleInventory, togglePerspective, selectSlot, cycleSlot,
  jump, startMining, stopMining, placeSelected }) {
  const keys = new Set();
  const pressed = (...codes) => Number(codes.some(code => keys.has(code)));

  controls.addEventListener('unlock', () => {
    keys.clear();
    stopMining();
  });
  addEventListener('blur', () => keys.clear());

  document.addEventListener('keydown', event => {
    keys.add(event.code);
    if (event.code === 'KeyE' && !event.repeat) toggleInventory();
    if (event.code === 'KeyV' && !event.repeat) togglePerspective();
    const slot = /^(?:Digit|Numpad)([1-9])$/.exec(event.code);
    if (slot) selectSlot(Number(slot[1]) - 1);
    if (event.code === 'Space') jump();
  });
  document.addEventListener('keyup', event => keys.delete(event.code));
  document.addEventListener('mousedown', event => {
    if (!controls.isLocked) return;
    if (event.button === 0) {
      startMining();
      event.preventDefault();
    }
    if (event.button === 2) placeSelected();
  });
  document.addEventListener('mouseup', event => {
    if (event.button === 0) stopMining();
  });
  document.addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('wheel', event => cycleSlot(event.deltaY > 0 ? 1 : -1));

  return function movementInput() {
    return {
      forwardInput: pressed('KeyW', 'KeyZ', 'ArrowUp') - pressed('KeyS', 'ArrowDown'),
      sideInput: pressed('KeyD', 'KeyQ', 'ArrowRight') - pressed('KeyA', 'ArrowLeft'),
    };
  };
}
