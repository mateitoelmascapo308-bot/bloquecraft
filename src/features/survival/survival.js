const MAX_VITAL = 20;

export function createSurvival({ renderStats, respawn, toast }) {
  let health = MAX_VITAL;
  let hunger = MAX_VITAL;
  let hungerTimer = 0;
  let starvationTimer = 0;

  function render() {
    renderStats({ health, hunger });
  }

  function damage(amount, message) {
    health = Math.max(0, health - amount);
    render();
    toast(message);
    if (health === 0) {
      health = MAX_VITAL;
      hunger = Math.max(hunger, 10);
      respawn();
      render();
      toast('Te desmayaste y volviste al inicio');
    }
  }

  function update(dt, { moving, fallDistance }) {
    const fallDamage = Math.floor(fallDistance - 3);
    if (fallDamage > 0) damage(fallDamage, `La caída te hizo ${fallDamage} de daño`);
    if (moving) {
      hungerTimer += dt;
      if (hungerTimer >= 45) {
        hunger = Math.max(0, hunger - 1);
        hungerTimer = 0;
        render();
      }
    }
    if (hunger === 0) {
      starvationTimer += dt;
      if (starvationTimer >= 8) {
        starvationTimer = 0;
        damage(1, 'El hambre te está haciendo daño');
      }
    } else starvationTimer = 0;
  }

  render();
  return { update };
}
