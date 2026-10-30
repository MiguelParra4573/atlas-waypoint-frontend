# Convenciones de código — atlas-waypoint-frontend

Cómo se escribe el código de este repo y qué lo verifica. El **por qué** de cada elección está en
`../docs/adr/0004-harness-de-calidad.md`, raíz del workspace, que aplica a los dos repos; acá está el
**cómo**.

La arquitectura —qué capa puede llamar a qué— es otro documento: `../docs/arquitectura.md` en la raíz
del workspace, sección "Frontend", que sirve a los dos repos.

## Puesta a punto

```bash
npm install    # instala y, con el script prepare, activa los hooks de git
```

No hace falta configurar `core.hooksPath` a mano: lo hace el script `prepare` en cada
`npm install`. Si alguna vez hay que forzarlo: `git config core.hooksPath .githooks`.

Hace falta **Node 22**.

## Los gates que rompen el build

| Gate | Comando | Qué verifica | Cómo se arregla |
| --- | --- | --- | --- |
| Prettier | `npm run format:check` | Formato de todo el repo menos el markdown | `npm run format` |
| oxlint | `npm run lint` | `correctness` y `suspicious` en error, `perf` en warn, y `--max-warnings 0` | El mensaje propone el arreglo |
| TypeScript | `npm run typecheck` | Tipado estricto de los dos proyectos | Arreglar el tipo; no se silencia con `any` |
| Vitest | `npm run test:coverage` | Tests, y genera `coverage/` | Escribir el test que falta |
| Vite | `npm run build` | Que el bundle de producción se construya | — |

CI los corre en ese orden, del más rápido y más barato de arreglar al más caro: si `tsc` ya falló,
`vite build` no agrega información.

El `pre-commit` corre solo los dos primeros, y **solo sobre los archivos staged**. No corre `tsc`,
que es de proyecto completo, ni los tests, ni el build: eso es trabajo de CI.

## Formato

**Prettier 3.9.10**, pineado exacto sin caret: es un gate que rompe el build, así que un
`npm install` en otra máquina no debe poder cambiarle la versión sin un commit.

```bash
npm run format          # formatea
npm run format:check    # verifica (lo corre CI y el pre-commit)
```

`.prettierrc.json` declara **solo** `singleQuote` y `semi: false`, que es lo que el código ya
practicaba. `printWidth`, `tabWidth` y `endOfLine` **no van ahí**: Prettier lee el `.editorconfig`
por defecto desde la 3.x, y repetirlos crearía una segunda fuente de verdad que después diverge. El
ancho de línea es el `max_line_length = 100` del `.editorconfig`.

El **markdown no se formatea**: está en `.prettierignore` porque las tablas de `CLAUDE.md` y de este
archivo están hechas a mano y Prettier las reacomoda en cada `format`.

Un commit de reformateo masivo **no lleva ningún otro cambio, nunca**, y su SHA va a
`.git-blame-ignore-revs`. Para que `git blame` local lo honre:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## Lint

`categories` en `.oxlintrc.json`, no una lista de reglas a mano:

| Categoría | Nivel | Razón |
| --- | --- | --- |
| `correctness` | `error` | Código que está mal, no que se ve distinto |
| `suspicious` | `error` | Lo mismo, con más falsos positivos tolerables |
| `perf` | `warn` | Vale verlo; con `--max-warnings 0` igual rompe CI |
| `pedantic`, `style` | `off` | **El estilo tiene un solo dueño, que es Prettier.** Dos dueños del estilo es el conflicto clásico |
| `restriction`, `nursery` | `off` | Opinión y reglas inestables |

Dos reglas puestas a mano por encima de las categorías:

- `react/exhaustive-deps` a **error**, no a warn. Con SSE y un store de Zustand, un array de
  dependencias incompleto es *el* bug recurrente.
- `react/react-in-jsx-scope` **apagada**. Es de `correctness`, pero da falso positivo con el
  transform nuevo de JSX (`"jsx": "react-jsx"` en `tsconfig.app.json`), que es el que usa este
  proyecto. Sin apagarla son 20 errores en `App.tsx` por JSX que no necesita `React` en alcance.

`--max-warnings 0` va en el script. Sin eso, un `warn` no se ve nunca.

## Tipado

`tsconfig.base.json` tiene el rigor, y `tsconfig.app.json` y `tsconfig.node.json` lo extienden. Lo
que está activado, más allá de `strict`:

- **`noUncheckedIndexedAccess`**: `vehiculos[i]` es `Vehicle | undefined`. Con listas que llegan de
  un stream, es la clase de bug que se ve en producción y no en el test.
- **`exactOptionalPropertyTypes`**: `prop?: X` no acepta `undefined` explícito.
- `noImplicitOverride`, `noImplicitReturns`.

Un error de tipo **no se silencia con `any` ni con `@ts-ignore`**. Si hace falta un escape, es
`@ts-expect-error` con un comentario que diga por qué, y falla el build el día en que el error
desaparece —que es exactamente lo que se quiere—.

`exactOptionalPropertyTypes` es el que puede doler con TanStack Query y las librerías de mapa, que
tipan props como `prop?: X`. Si se vuelve impracticable se apaga **en un PR con la razón escrita**,
nunca en silencio.

`skipLibCheck` se mantiene en `true`: los tipos de terceros no son trabajo de este repo.

## Cobertura

```bash
npm run test:coverage    # genera coverage/index.html
```

**Sin umbral todavía**, a propósito. Hoy `src/` es el scaffold de Vite y se borra con la primera
pantalla real: un umbral acá pinearía un número que mide código condenado. La medición actual —50 %
de statements, 100 % de branches sobre 0 ramas— no dice nada del proyecto.

El umbral entra con la pantalla del mapa y el store del stream, y desde ahí **solo sube**.

## La frontera de `lib/api` — pendiente, con el bloque ya escrito

`../docs/arquitectura.md` § Frontend dice que **ningún componente llama `fetch` ni abre un SSE
directo**: todo acceso a la red pasa por `src/lib/api/`. Hoy eso es prosa, porque `src/features/`,
`src/shared/` y `src/lib/api/` **no existen**.

Se difiere a propósito, no por pereza: los globs apuntarían a carpetas vacías, oxlint no falla por un
glob sin coincidencias, y quedaría una regla que uno *cree* tener. Entra en el mismo PR que crea
`lib/api`, con un commit que mete un `fetch` en un componente a propósito y comprueba que el lint
falla con el mensaje escrito. Es el mismo criterio con el que se verificó cada regla de este harness.

El bloque que hay que pegar en `.oxlintrc.json` ese día:

```json
"overrides": [
  {
    "files": ["src/features/**", "src/shared/**"],
    "rules": {
      "no-restricted-globals": [
        "error",
        { "name": "fetch", "message": "La red se accede por src/lib/api/." },
        { "name": "EventSource", "message": "El SSE se abre en src/lib/api/." },
        { "name": "WebSocket", "message": "La red se accede por src/lib/api/." },
        { "name": "XMLHttpRequest", "message": "La red se accede por src/lib/api/." }
      ],
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["@microsoft/fetch-event-source"],
              "message": "Se envuelve en src/lib/api/, no se importa en un componente."
            },
            {
              "group": ["**/features/*/internal/**"],
              "message": "Esa carpeta es privada del feature."
            }
          ]
        }
      ]
    }
  },
  { "files": ["src/lib/api/**"], "rules": { "no-restricted-globals": "off" } }
]
```

Se usa `no-restricted-globals` y no `no-restricted-syntax` porque **oxlint no tiene
`no-restricted-syntax`** —verificado: cero ocurrencias en su `configuration_schema.json`—, y lo que
hay que prohibir son identificadores globales, que es justo su dominio.

**Límite conocido, declarado en vez de disimulado:** `const { fetch } = window` y un `import()`
dinámico se escapan de la regla. El gate enseña y atrapa el caso normal; no es una frontera
hermética.

Descartados: `dependency-cruiser` (una dependencia más, un lenguaje de configuración propio y un
segundo lugar donde vive la regla) y un test de Vitest con expresiones regulares (falsos positivos en
strings y comentarios, y sin aviso en el editor, que es donde la regla tiene que aparecer para
enseñar).

## Idioma y nombres

Igual que el backend, y por la misma razón: es un proyecto de portafolio de un autor, no un ERP
multiequipo.

- En **inglés**: nombres de tipo y de componente (`VehiclePanel`, `AlertBadge`), campos de DTO y de
  evento —son el contrato con el backend—, y los nombres de archivo que siguen al componente.
- En **español**: la prosa, los comentarios, y los nombres de función de negocio
  (`vehiculosActivos`, `formatearPatente`).

## Commits

Convencionales, validado por `.githooks/commit-msg`, que es **byte por byte el mismo archivo que en
el backend**: si se cambia uno, se cambia el otro.

```
<tipo>(<alcance opcional>): <asunto en minúscula, hasta 80 caracteres>
```

Tipos: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `style`, `test`. El cuerpo
y el pie quedan libres. Los mensajes que genera git solo (`Merge`, `Revert`, `fixup!`, `squash!`,
`Reapply`) no se validan: sin ese escape, `git merge` y `git rebase --autosquash` fallarían.

El `pre-commit` **verifica, nunca arregla**: un hook que reescribe archivos con staging parcial deja
el índice desincronizado y commitea algo que nadie leyó. Eso es también lo que hace innecesario
`lint-staged`.

## Trampas conocidas

Tres cosas que no se deducen leyendo el `package.json`:

1. **El `pre-commit` usa dos listas de archivos, no una.** Prettier formatea también `css`, `json` y
   `html`, pero oxlint solo entiende JavaScript y TypeScript y **sale con error** si en la lista no
   hay ninguno que le corresponda (`No files found to lint`). Con una sola lista, un commit que solo
   toca `package.json` fallaría por un falso positivo.
2. **El ancho de línea vive en el `.editorconfig`, no en `.prettierrc.json`.** Si alguien borra
   `max_line_length = 100`, Prettier vuelve a 80 **sin avisar** y el siguiente `format` reformatea
   todo el repo. Verificación: una línea de 85 caracteres tiene que sobrevivir a
   `npx prettier <archivo>` y partirse con `npx prettier --no-editorconfig <archivo>`.
3. **Las versiones de `prettier` y `oxlint` van sin caret a propósito.** El `^1.81.0` anterior de
   oxlint ya había dejado que `node_modules` subiera solo a 1.86.0. Para una herramienta que rompe el
   build, eso significa que un `npm install` en otra máquina puede romper CI sin ningún commit. Los
   sube Dependabot, en un PR que se ve.

Y una del entorno: los hooks se ejecutan con el `sh` de Git for Windows. Si un hook tuviera CRLF
fallaría con `bad interpreter: /bin/sh^M` y **git no avisa**, se lo saltaría en silencio; de eso se
encarga la regla `/.githooks/** text eol=lf` del `.gitattributes`.
