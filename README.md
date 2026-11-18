# Bloquecraft

Juego de supervivencia 3D en un mundo de bloques. Explora, reúne materiales, fabrica herramientas y construye.

- [Jugar en GitHub Pages](https://mateitoelmascapo308-bot.github.io/bloquecraft/)
- [Colaborar con Git y ChatGPT](CONTRIBUTING.md)

## Ejecutar en local

Desde la raíz del repositorio, levanta un servidor HTTP con Python 3.

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abre [Bloquecraft en localhost](http://127.0.0.1:8000/). Los módulos de JavaScript necesitan HTTP y Three.js se carga desde una CDN. La raíz del repositorio se puede servir directamente en GitHub Pages, sin compilación.

## Controles

| Acción | Control |
|---|---|
| Moverse y mirar | WASD, ZQSD o flechas. Usa el ratón para mirar. |
| Saltar | Espacio |
| Picar | Mantener clic izquierdo |
| Colocar un bloque | Clic derecho |
| Elegir ranura rápida | 1–9 o rueda del ratón |
| Abrir el inventario y fabricar objetos | E |
| Cambiar de perspectiva | V |
| Liberar el ratón | Esc |

El terreno se carga en chunks de 16 × 16 y la bedrock está en Y = −32. Los materiales se agrupan en pilas de hasta 64. El hambre baja al moverse y las caídas pueden causar daño.

## Arquitectura

| Ruta | Responsabilidad |
|---|---|
| `index.html` | Contenedor de la interfaz y entrada para GitHub Pages. |
| `src/main.js` | Conecta las funcionalidades y define el orden de actualización por fotograma. |
| `src/core/` | Escena Three.js, renderizado, entrada de teclado y ratón, y controles generales de interfaz. |
| `src/features/world/` | Terreno, chunks, estado del mundo, representación visual y selección de bloques. |
| `src/features/player/` | Movimiento, colisiones, cámara y avatar. |
| `src/features/blocks/` | Picado, colocación de bloques y barra de progreso. |
| `src/features/inventory/` | Pilas, ranuras, selección y presentación del inventario. |
| `src/features/crafting/` | Recetas y su interfaz. Usa las operaciones públicas del inventario. |
| `src/features/survival/` | Vida, hambre, daño y sus indicadores. |
| `src/features/footsteps/` | Detección de la superficie bajo el jugador y sonido de los pasos. |
| `src/shared/items.js` | Catálogo de materiales y objetos compartido por varias funcionalidades. |

Una funcionalidad mantiene su lógica, vista y estilos en su carpeta cuando los necesita. Los módulos de estado son dueños de sus datos y exponen operaciones como `world.placeBlock()` e `inventory.exchange()`. Conecta las nuevas funcionalidades desde `src/main.js` y evita dependencias circulares al compartir comportamiento.

## Verificar cambios

Ejecuta las pruebas de lógica con Node.js 22 o posterior.

```powershell
node --test
```

Para cambios jugables o visuales, abre también el juego en el navegador y prueba los controles afectados.
