# Instrucciones para trabajar en Bloquecraft

- Lee `README.md` para ubicar la funcionalidad y `CONTRIBUTING.md` para seguir el flujo de ramas.
- Al iniciar una edición, comprueba la rama y el estado con `git status --short --branch`. Usa una rama por tarea basada en `main` reciente y conserva los cambios existentes de ambos colaboradores.
- Si la sesión tiene acceso a los archivos y `.git` está en solo lectura, indica la limitación. Confirma en qué rama quedaron los cambios antes de reportar cualquier operación de Git como completada.
- Pon las nuevas mecánicas en `src/features/<feature>/`. Conecta sus APIs en `src/main.js`, conserva separados el estado y la presentación cuando corresponda y reutiliza el catálogo de `src/shared/items.js` para objetos y bloques.
- Mantén la compatibilidad con GitHub Pages y usa rutas relativas para los archivos del proyecto.
- Ejecuta `node --test` y resume las pruebas realizadas. Si cambia la jugabilidad o la interfaz, verifica el recorrido afectado en el navegador cuando esté disponible.
- Crea commits, publica ramas o abre un PR cuando la tarea lo solicite. Integra cambios en `main` a través del PR.
