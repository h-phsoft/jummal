# Project rules (دراسات عددية في القرآن الكريم: Jummal + PhsQuran)

Full handover guide (architecture, data, decisions, deploy, known issues): **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)**. Read it before changing anything.

## Non-negotiable
- **Offline, files only, no database.** Data lives in `data/*.js` (`const qAyatData = [...]` format). Never add a database or a required server.
- **One source per calculation.** Every calculation lives in `packages/core/src` (`@jummal/core`) and is called from the browser (`frontend`); a future optional API must call the same core. Never duplicate logic in a component or route.
- **No PHP, no jQuery.** UI is React (`frontend/src`), composed of components.

## Layout
- `packages/core`: pure functions that take data as parameters. Tests in `packages/core/test` (`npm test`) compare against known values, legacy results in `test/fixtures/` and data integrity. Add a test with every new calculation.
- `frontend`: React + Vite + PWA, `base: './'`, `HashRouter` (works in a cPanel subfolder and inside the exe). Data is loaded by `src/services/data.js` from `public/data/*.json`, which `scripts/prepare-data.mjs` generates from `data/` (git-ignored). `src/services/api.js` answers the old `/api/...` paths locally.
- No backend yet: an optional API may be added later for external users (never required, never Passenger on cPanel). See docs/DEVELOPMENT.md §7.
- `desktop`: Electron serves `frontend/dist` through the `app://` scheme. `npm run build:exe` makes a portable exe.
- Old code (legacy pages, the first Express server, the icon generator) is only in git history; see docs/DEVELOPMENT.md.

## Text rules (user-confirmed)
- Study/calculation: `ayat28Text`, `text28`. Search without tashkil: `ayatOText`/`ayatSearch`, `otext`. With tashkil: `ayatNText`, `ntext`.
- 28-letter text: standalone hamza (ء) dropped; أإآ→ا, ة→ه, ؤ→و, ىئ→ي; conjunction waw is its own word. Do not "fix" these in the data.

## Style
- 2-space indentation, never tabs. Always braces on if/else/for/while.
- Arabic is the default language (RTL); every UI string goes in `frontend/src/locales/ar.json` and `en.json`.
