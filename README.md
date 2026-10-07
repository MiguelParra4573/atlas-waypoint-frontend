# Atlas Waypoint — Frontend

Torre de control de flota: mapa en vivo, panel de vehículos, alertas y KPIs. React 19 + TypeScript + Vite.

Backend, simulador y entorno local (Docker Compose): [atlas-waypoint-backend](https://github.com/MiguelParra4573/atlas-waypoint-backend).

## Cómo correrlo

Requisitos: Node 22.

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests (Vitest + Testing Library) |
| `npm run lint` | Lint (oxlint) |
| `npm run build` | Typecheck y build de producción |

Commits convencionales (`feat:`, `fix:`, `chore:`...). Una fase = una rama + un PR + un tag. El plan completo está en el repo del backend (`docs/`).
