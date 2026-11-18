# Dashboard

Vite + React + TypeScript. Static site: no backend.

```sh
npm run dev        # http://localhost:5173
npm run build      # typecheck, then build to dist/ (relative paths, host anywhere)
npm run preview    # serve dist/
npm run typecheck
```

- **Data** is read straight from `data/` and emitted as static JSON assets, so a refresh is just
  `npm run data` / `npm run data:usage` and a reload. Every `data/usage/<month>/*.json` summary shows
  up in the usage picker; the `*.raw.json` files are excluded.
- **Logic** lives in `src/` and is shared with the Node tests. `web/src/core.ts` adds types to it.
  The main thread only imports modules that don't need `@smogon/calc`. `calcSetVsSet` and `speedOf`
  run in `calc.worker.ts`, so editing the team doesn't block the page.
- **Views:** Damage (best move each way plus speed per pairing; click a cell for every move),
  Speed tiers, Defense (team type chart), Coverage.
- **Saved teams:** each Showdown paste in `web/src/teams/*.txt` appears in the team picker; the first
  one is the default team.
- **Sprites** are loaded at runtime from Pokémon Showdown's gen5 sprite set (`components/Sprite.tsx`),
  so they need a network connection. 11 Champions-new Megas have no sprite there yet and show their
  base forme, dimmed.
- The pasted team and the settings are kept in `localStorage`, for this browser only.
