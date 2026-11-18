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
- How to load it: don't parse the TypeScript. Load the mod through the `pokemon-showdown`
  npm package (or `@pkmn/dex` + `@pkmn/mods`) and export JSON. That also provides base
  stats, types, abilities and learnsets.

### 2. Opponent data: Smogon usage stats

- Monthly files, e.g. `https://www.smogon.com/stats/2026-10/chaos/gen9championsvgc2026regmc-1760.json`
- Formats available: `gen9championsvgc2026regmc` and `gen9championsvgc2026regmcbo3`,
  with rating cutoffs `0`, `1500`, `1630`, `1760`.
- Contents: usage %, items, moves, abilities, spreads, teammates, checks/counters per
  Pokémon. This is the main input for matchup analysis.
- These numbers come from Showdown players, not the in-game ladder.
  [MunchStats](https://www.munchstats.com/about/) has separate in-game usage formats if
  you want to compare.

### 3. Cross-check lists (manual or scraped, no API)

| Source | Notes |
| --- | --- |
| [Bulbapedia – Regulation Set M-C](https://bulbapedia.bulbagarden.net/wiki/Draft:Regulation_Set_M-C) | Still a draft page |
| [Pokémon-Zone – M-C](https://www.pokemon-zone.com/champions/regulations/m-c/) | Lists the 18 new items (e.g. Absolite Z) |
| [MetaVGC – M-C](https://metavgc.com/regulations/regulationm-c) | Totals: ~224–229 Pokémon, 148 items, 16 Megas (its pages don't agree) |
| [Victory Road – Regulations](https://victoryroad.pro/champions-regulations/) | |
| [GameWith – M-C](https://gamewith.ai/pokemon-champions/en/articles/regulation-mc) | Counts forms separately; data still being added |

Use these to check the Showdown export, not as the main source.

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
2. **Validate:** compare species and item lists against the Bulbapedia / Pokémon-Zone
   M-C lists and report any differences.
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
