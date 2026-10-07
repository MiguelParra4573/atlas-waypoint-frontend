# CLAUDE.md

Guía para Claude Code en este repositorio.

## Qué es

Frontend de la torre de control de flota (proyecto de portafolio). Repo separado del backend: [atlas-waypoint-backend](https://github.com/MiguelParra4573/atlas-waypoint-backend), donde viven el plan (`docs/`), los ADRs, el simulador y el Docker Compose del entorno.

Stack: Vite + React 19 + TypeScript. Tests con Vitest y Testing Library, lint con oxlint.

## Comandos

```bash
npm install
npm run dev
npm run lint && npm test && npm run build
```

## Decisiones previstas (Fase 5 del plan)

- Mapa con Leaflet o MapLibre; marcadores que se mueven y color por estado.
- Tiempo real por SSE con `@microsoft/fetch-event-source` (permite header `Authorization`) y reconexión automática.
- TanStack Query para REST y Zustand para el estado del stream.
- Access token en memoria; refresh por cookie `httpOnly`. Rutas protegidas por rol (ADMIN, DESPACHADOR, SUPERVISOR).

## Flujo de trabajo

- Una fase = una rama + un PR + un tag. Commits convencionales.
- El contrato con el backend (endpoints, eventos SSE) lo define la API del repo backend (OpenAPI).
