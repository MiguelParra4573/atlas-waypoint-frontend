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
| `npm run test:coverage` | Tests y reporte de cobertura en `coverage/` |
| `npm run lint` | Lint (oxlint, sin tolerar warnings) |
| `npm run format` | Formatea con Prettier |
| `npm run format:check` | Verifica el formato (lo corre CI) |
| `npm run typecheck` | Tipado estricto de los dos proyectos |
| `npm run build` | Typecheck y build de producción |

## Puesta a punto tras clonar

`npm install` ya activa los hooks de git. Opcional, para que `git blame` ignore el commit de
reformateo:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

Las convenciones de código y los gates que rompen el build están en
[convenciones.md](convenciones.md).

Commits convencionales (`feat:`, `fix:`, `chore:`...), validados por `.githooks/commit-msg`. Una fase
= una rama + un PR + un tag. El plan completo está en el repo del backend (`docs/`).
