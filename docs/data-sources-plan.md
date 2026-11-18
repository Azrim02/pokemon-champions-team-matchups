# Data Sources Plan — Pokémon Champions, Regulation M-C

Goal: build a dataset of every Pokémon and held item legal in Pokémon Champions
Regulation M-C (runs 2026-09-09 → 2026-12-02), plus opponent usage data, to power a
team-matchup dashboard.

_Researched 2026-11-18._

## Recommended sources

### 1. Main source for legality: Showdown `champions` data mod

- Repo path: [`smogon/pokemon-showdown`](https://github.com/smogon/pokemon-showdown) →
  `data/mods/champions/`
  - `formats-data.ts`: legality per species (`isNonstandard`, `tier`)
  - `items.ts`: item overrides (~250 `isNonstandard` entries)
  - `learnsets.ts`, `moves.ts`, `abilities.ts`, `conditions.ts`, `rulesets.ts`, `scripts.ts`
- Verified in `config/formats.ts`:
  - `[Gen 9 Champions] VGC 2026 Reg M-C` (and Bo3) → mod `champions`
  - `[Gen 9 Champions] VGC 2026 Reg M-B` → mod `championsregmb`
  - So the `champions` mod currently means M-C. When M-D arrives, M-C will likely be
    moved into its own `championsregmc` mod, so pin a commit.
- Ruleset is `Flat Rules`: Level 50, Species Clause, Item Clause = 1, no Mythicals or
  Restricted Legendaries, Bring 6 Pick 4 (doubles).
- How to get the legal pool: filter out entries with `isNonstandard: "Past"` /
  `tier: "Illegal"`, then apply the Flat Rules bans.
- How to load it: don't parse the TypeScript. `pipeline/setup-showdown.js` clones Showdown
  from git at the commit pinned in `pipeline/config.js` and builds it, and `export-dex.js`
  exports JSON through its `Dex`. That also provides base stats, types, abilities and
  learnsets. The `pokemon-showdown` npm package isn't used: its latest release (0.11.11,
  2026-07-28) predates M-C.

### 2. Opponent data: Smogon usage stats

- Monthly files, e.g. `https://www.smogon.com/stats/2026-10/chaos/gen9championsvgc2026regmc-1760.json`
- Formats available: `gen9championsvgc2026regmc` and `gen9championsvgc2026regmcbo3`,
  with rating cutoffs `0`, `1500`, `1630`, `1760`.
- Contents: usage %, items, moves, abilities, spreads, teammates, checks/counters per
  Pokémon. Usage, items, moves, abilities and spreads are the main input for matchup
  analysis. Checks and counters are nearly empty at high cutoffs: at 1760 in 2026-10,
  only 1 of 277 Pokémon has any, so don't rely on them (try cutoff 0 or 1500).
- These numbers come from Showdown players, not the in-game ladder.
  [MunchStats](https://www.munchstats.com/about/) has separate in-game usage formats if
  you want to compare.

### 3. Cross-check lists (manual or scraped, no API)

| Source | Notes |
| --- | --- |
| [Bulbapedia – Regulation Set M-C](https://bulbapedia.bulbagarden.net/wiki/Regulation_Set_M-C) | Full article (the draft page is gone). Omits Kingambit, which is on the official list |
| [Pokémon-Zone – M-C](https://www.pokemon-zone.com/champions/regulations/m-c/) | Lists the 18 new items (e.g. Absolite Z) |
| [MetaVGC – Regulations](https://metavgc.com/regulations) | No M-C page (the M-C URL redirects here). Its "224 Pokémon, 148 items, 16 Megas" are **M-B** figures |
| [Victory Road – Regulations](https://victoryroad.pro/champions-regulations/) | |
| [GameWith – M-C](https://gamewith.ai/pokemon-champions/en/articles/regulation-mc) | Counts forms separately; data still being added |

Use these to check the Showdown export, not as the main source. The primary list is the
[official in-game eligible list](https://web-view.app.pokemonchampions.jp/battle/pages/events/rs178713870219xeaaio/en/pokemon.html),
linked from the official regulation page.

M-C totals, as checked in `docs/verification-report.md`: **231 species** (matches the official
list by dex number), **166 items** (M-B's 148 plus 18 new, matching Serebii), **81 Mega Stones**.

### 4. Use with caution

- [otterlyclueless/pokemon-champions-data](https://github.com/otterlyclueless/pokemon-champions-data)
  (CC BY 4.0): structured JSON for roster, stats, moves, items and learnsets. Last commit
  2026-04-16, before M-C, and it doesn't track which regulation an entry is legal in. Its
  `mechanics/` docs (`sp-system.md`, `stat-formula.md`) are still useful.
- PokéAPI: has no Champions legality data. Only use it for sprites and flavour text.

## Pipeline

1. **Export:** a script loads the Showdown `champions` mod (pinned commit) and writes
   `data/pokemon.json`, `data/items.json`, `data/moves.json` and `data/learnsets.json`,
   filtered to M-C legal entries.
2. **Validate:** compare species and item lists against an external M-C list and report
   any differences. `validate.js` does this when `data/reference/regulation-m-c.json`
   exists; it doesn't yet, so the comparison is currently skipped (with a warning).
3. **Usage:** fetch the latest M-C `chaos` JSON each month (pick the rating cutoff, and
   Bo1 or Bo3) into `data/usage/`.
4. **Mechanics:** add the type chart and the Champions stat formula for matchup and
   damage logic.

## Things to check

- [ ] How `items.ts` marks M-C legality (it looks like the same `isNonstandard`
      pattern as species).
- [ ] Champions calculates stats differently from the main games: check Showdown's
      numbers against in-game values for a few Pokémon.
- [ ] Megas and Mega Z forms: confirm they appear as separate species entries and are
      linked to their stones.
- [ ] Data licence and attribution for Smogon stats and the community datasets.
