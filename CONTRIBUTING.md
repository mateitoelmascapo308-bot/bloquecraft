# Colaborar en Bloquecraft

`main` es la rama que alimenta la versión jugable. Cada cambio empieza desde `main` actualizado, tiene una rama propia y llega por un pull request (PR). Quien abre el PR describe qué cambió y cómo lo verificó. La otra persona revisa el cambio antes de integrarlo.

## Nombres de ramas

Usa `tipo/feature-descripcion` en minúsculas, con guiones. Empieza la descripción con la funcionalidad que vas a tocar cuando corresponda.

| Tipo | Ejemplo |
|---|---|
| Funcionalidad | `feat/survival-alimentos` |
| Corrección | `fix/world-carga-de-chunks` |
| Refactorización | `refactor/player-colisiones` |
| Documentación | `docs/guia-de-colaboracion` |
| Mantenimiento | `chore/actualizar-three` |

## Desde la idea hasta el PR

1. Acuerden la tarea y quién la toma antes de abrir un chat. Si ambos van a tocar la misma funcionalidad o el mismo archivo compartido, acuerden el orden de integración.
2. Partan desde una copia limpia. Actualicen `main` y creen la rama de la tarea.

   ```powershell
   git switch main
   git pull --ff-only origin main
   git switch -c feat/survival-alimentos
   ```

3. Usen un chat por tarea. Si trabajan en el mismo PC al mismo tiempo, usen carpetas de trabajo separadas, por ejemplo mediante `git worktree`. Una carpeta compartida tiene una sola rama activa a la vez.
4. Revisen el diff y ejecuten `node --test`. Para mecánicas nuevas, incluyan en el PR los pasos para probarlas en el navegador. Si una prueba queda pendiente, indíquenlo.
5. Hagan commits enfocados, publiquen la rama y abran un PR contra `main`. Incluyan un resumen, los pasos de prueba y las decisiones que afecten a otras funcionalidades.
6. Si `main` avanzó y necesitan incorporarlo, ejecuten `git fetch origin` y luego `git merge origin/main` desde su rama. Resuelvan los conflictos y repitan las pruebas. Después de la revisión, integren el PR y actualicen `main` antes de empezar otra tarea.

## Prompt para empezar una tarea en ChatGPT

> Trabaja en el repositorio Bloquecraft. La tarea es [objetivo y criterio para darla por terminada]. La rama es [rama] y la funcionalidad principal es [carpeta]. Lee `AGENTS.md` y `CONTRIBUTING.md`. Comprueba la rama y el estado real de Git al empezar. Revisa los cambios y dime qué probaste y qué quedó pendiente.

Si una sesión de ChatGPT tiene `.git` en solo lectura, prepara la rama desde una terminal con acceso a la carpeta y vuelve a comprobarla en el chat antes de empezar.
