export function mountHud({ controls, overlay, inventoryPanel, start, resume, toastElement, coords, onPlay }) {
  let inventoryOpen = false;
  let toastTimer;

  function setInventoryOpen(open) {
    inventoryOpen = open;
    inventoryPanel.style.display = open ? 'block' : 'none';
  }

  function resumeGame() {
    setInventoryOpen(false);
    onPlay();
    controls.lock();
  }

  function toggleInventory() {
    if (inventoryOpen) resumeGame();
    else if (controls.isLocked) {
      setInventoryOpen(true);
      controls.unlock();
    }
  }

  start.addEventListener('click', resumeGame);
  resume.addEventListener('click', resumeGame);
  controls.addEventListener('lock', () => {
    setInventoryOpen(false);
    overlay.style.display = 'none';
  });
  controls.addEventListener('unlock', () => {
    overlay.style.display = inventoryOpen ? 'none' : 'grid';
  });

  function toast(message) {
    toastElement.textContent = message;
    toastElement.style.opacity = 1;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastElement.style.opacity = 0; }, 1100);
  }

  function showPosition({ x, y, z }) {
    coords.textContent = `X ${x.toFixed(1)} · Y ${y.toFixed(1)} · Z ${z.toFixed(1)}`;
  }

  return { toggleInventory, toast, showPosition };
}
