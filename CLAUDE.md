# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Data pipeline + static dashboard for Pokémon Champions team matchup analysis, scoped to one VGC
regulation (currently **Regulation M-C**, Showdown format `gen9championsvgc2026regmc`). Node ≥ 22,
ESM throughout. More detail lives in `pipeline/README.md`, `src/README.md` and `web/README.md`;
the dataset design is in `docs/data-sources-plan.md`.

## Commands

```sh
npm test                                  # all tests (node:test); Showdown integration tests skip without vendor/
npm run test:unit                         # pipeline/lib unit tests only
node --test test/calc.test.js             # one file
node --test --test-name-pattern="Last Respects" test/calc.test.js   # one test by name

npm run dev                               # dashboard at http://localhost:5173
npm run typecheck                         # tsc -p web (the only type check; src/ is plain JS, checkJs off)
npm run build                             # typecheck + vite build to dist/

npm run data                              # setup:showdown → data:dex → data:validate
npm run data:usage -- --month 2026-10     # fetch Smogon usage (defaults in pipeline/config.js)
```

There is no linter. CI (`.github/workflows/pages.yml`) runs `npm test` and `npm run build` on push
to `main` and deploys `dist/` to GitHub Pages.

## Architecture

Three layers, with a one-way flow: **pipeline → committed `data/` → `src/` logic → `web/` UI**.

1. **`pipeline/`** (Node only). Clones Pokémon Showdown at the commit pinned in
   `pipeline/config.js` into `vendor/pokemon-showdown/` (gitignored), then uses that format's
   validator to export only M-C-legal data to `data/*.json`. `fetch-usage.js` downloads Smogon
   usage stats and writes a trimmed summary to `data/usage/<month>/<format>-<cutoff>.json`
   (the `*.raw.json` download is gitignored). The export has no timestamp, so re-running it at the
   same commit must give no git diff. `test/showdown.test.js` fails if `data/pokemon.json` is stale
   for the pinned commit.
2. **`src/`** (browser-safe ESM: no Node built-ins, no I/O). All matchup logic, shared by the
   Node tests and the dashboard. Callers load the JSON and pass it to `createDataset()`.
   `calc.js` and `speed.js` wrap `@smogon/calc` (Champions mechanics = gen 0); the other modules
   do not import it.
3. **`web/`** (Vite + React + TS, `root: 'web'` in `vite.config.ts`). Imports `../../src/*.js` and
   `../../data/*.json` directly; there is no copy step. `web/src/core.ts` re-exports the `src/`
   functions with types from `web/src/types.ts`. Everything that needs `@smogon/calc` runs in
   `calc.worker.ts` (via `lib/useCalcWorker.ts`); the main thread must not import `calc.js` or
   `speed.js`. Usage summaries are discovered with `import.meta.glob`, and saved teams are the
   Showdown pastes in `web/src/teams/*.txt` (`DEFAULT_TEAM` in `web/src/teams.ts` is the default).

Tests load the real committed dataset via `test/helpers/dataset.js`, which also has a `set()`
builder for test sets.

## Conventions that span files

- **Join on `id`, never `name`** (e.g. Sirfetch’d uses different apostrophes in dex vs. usage).
  Item/move/ability entries in usage summaries are already IDs.
- **Stat Points, not EVs**: Champions uses SPs (32 per stat, 66 total, `SP_LIMITS` in
  `src/data.js`). They are stored in Showdown's `evs` field; pastes may use `EVs:` or `SPs:`.
- **Sets** use Showdown's `PokemonSet` shape. Optional battle state lives in
  `set.state = { boosts, status, curHPPct, abilityOn, mega }`; usage-derived percentages in `set.usage`.
- **Megas**: a set holding its Mega Stone is calc'd as the Mega forme unless `state.mega === false`.
  Usage stats name Megas directly; `opponents.js` maps them back to base forme + stone and keeps the
  Mega's ability in `set.usage.battleAbility` (used by `weather.js` for weather setters).
- **Conditions default to Doubles** (spread moves get 0.75×). `mySide`/`oppSide` swap automatically
  when the opponent attacks.
- **Calc data parity**: `@smogon/calc` ships its own data; `test/calc-parity.test.js` checks it
  against our export. Known differences are handled with aliases in `calc.js`. Mechanics the calc
  lacks (e.g. Last Respects base power per faint) are patched in `src/calc.js`.
- **New regulation**: update `SHOWDOWN.commit` and `REGULATION` in `pipeline/config.js`, then
  `npm run data`. Showdown's `champions` mod always tracks the current regulation.

## Verification

`.claude/agents/repo-verifier.md` defines a `repo-verifier` subagent that fact-checks data, docs
and tests against primary sources and writes `docs/verification-report.md`. Use it after data
refreshes or regulation changes.
