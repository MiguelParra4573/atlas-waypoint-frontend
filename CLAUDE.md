# CLAUDE.md

Guía para Claude Code en este repositorio.

## Qué es

Frontend de la torre de control de flota (proyecto de portafolio). Repo separado del backend: [atlas-waypoint-backend](https://github.com/MiguelParra4573/atlas-waypoint-backend), donde viven el plan (`docs/`), los ADRs, el simulador y el Docker Compose del entorno.

Stack: Vite + React 19 + TypeScript. Tests con Vitest y Testing Library, lint con oxlint.

## Comandos

```bash
npm install                  # instala y activa los hooks de git (script prepare)
npm run dev
npm run format               # formatea con Prettier
npm run format:check && npm run lint && npm run typecheck && npm run test:coverage && npm run build
```

La última línea es, en orden, lo mismo que corre CI. Las convenciones de código y los gates que
rompen el build están en [convenciones.md](convenciones.md); el por qué de cada elección, en
`docs/adr/0004-harness-de-calidad.md` del repo del backend, que aplica a los dos.

## Decisiones previstas (Fase 5 del plan)

- Mapa con Leaflet o MapLibre; marcadores que se mueven y color por estado.
- Tiempo real por SSE con `@microsoft/fetch-event-source` (permite header `Authorization`) y reconexión automática.
- TanStack Query para REST y Zustand para el estado del stream.
- Access token en memoria; refresh por cookie `httpOnly`. Rutas protegidas por rol (ADMIN, DESPACHADOR, SUPERVISOR).

## Flujo de trabajo

- Una fase = una rama + un PR + un tag. Commits convencionales.
- El contrato con el backend (endpoints, eventos SSE) lo define la API del repo backend (OpenAPI).
