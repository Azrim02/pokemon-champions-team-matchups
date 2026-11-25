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
- **Views:** Team (the team builder, full width: paste text plus a card per Pokémon), then Damage (best move each way plus speed per pairing; click a cell for every move),
  Speed tiers, Defense (a draggable graph of the
  defensive cores, from `src/cores.js`, coloured by the weakness covered, above the team type chart), Coverage.
- **Saved teams:** each Showdown paste in `web/src/teams/*.txt` appears in the team picker; `DEFAULT_TEAM`
  in `teams.ts` names the one a first visit starts from. A `=== [format] Name ===` first line (Showdown's
  teambuilder header) sets the name shown in the picker; otherwise it's made from the file name.
- **Weather from setters** (Field panel): each pairing involving a weather setter is calc'd in that
  setter's weather (a Mega setter beats a regular one; otherwise the slower setter's weather wins).
  The Weather dropdown applies to every other pairing. Only the setter's own pairings change, not
  its teammates', so a Chlorophyll partner of Charizard-Y still uses the dropdown.
- **Fainted** (Field panel): fainted Pokémon on each side, 0 to 3. Last Respects gets 50 more base
  power per faint (`src/calc.js` sets it, since `@smogon/calc` doesn't), and Supreme Overlord gets
  its boost. In a cell's detail, those moves also show their damage at 0, 1, 2 and 3 faints.
- **Sprites** are loaded at runtime from Pokémon Showdown's gen5 sprite set (`components/Sprite.tsx`),
  so they need a network connection. 11 Champions-new Megas have no sprite there yet and show their
  base forme, dimmed.
- The team text and the settings are kept in `localStorage`, for this browser only, and restored on
  the next visit. When `DEFAULT_TEAM` changes, a browser still holding an unedited bundled team
  moves to the new one once; edited and pasted teams are never replaced.
