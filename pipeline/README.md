# Data pipeline

Builds the Regulation M-C dataset described in [`docs/data-sources-plan.md`](../docs/data-sources-plan.md).
Requires Node ≥ 22 and git.

```sh
npm run data                                   # setup:showdown → data:dex → data:validate
npm run data:usage -- --month 2026-10          # Smogon usage (defaults: last month, VGC M-C, 1760)
npm run data:usage -- --format gen9championsvgc2026regmcbo3 --cutoff 1500
```

| Step | Script | Output |
| --- | --- | --- |
| Fetch and build Showdown at the commit pinned in `config.js` | `setup-showdown.js` | `vendor/pokemon-showdown/` (gitignored) |
| Export legal data using the format's validator | `export-dex.js` | `data/{pokemon,items,moves,abilities,learnsets,typechart,meta}.json` |
| Consistency checks, plus a diff against `data/reference/regulation-m-c.json` if present | `validate.js` | exit code 1 on errors |
| Usage stats: raw file plus a trimmed summary | `fetch-usage.js` | `data/usage/<month>/<format>-<cutoff>{,.raw}.json` (raw file gitignored; summary committed) |

## Tests

```sh
npm test         # everything (Showdown integration tests skip unless setup:showdown has run)
npm run test:unit
```

- `test/{io,usage,species,validate}.test.js`: unit tests for the pure helpers in `pipeline/lib/`.
- `test/data.test.js`: regression checks on the committed `data/*.json` (known legal and illegal
  Pokémon, Mega Stones, type chart).
- `test/showdown.test.js`: checks the legality helpers against the built sim, and fails if
  `data/pokemon.json` is out of date for the pinned commit.

## What's committed

The dex export and the monthly usage summaries are committed. The raw Smogon downloads
(`*.raw.json`, ~19 MB each) are gitignored and can be downloaded again with `--force`.
The export has no timestamp, so re-running it at the same commit gives no git diff.

## Notes

- **Joining data:** join on `id`, not on `name`. For example, Showdown writes Sirfetch’d with a
  curly apostrophe in the dex and a straight one in the usage stats. Item, move and ability
  entries in the usage summary are already IDs.
- **Battle-only formes:** `pokemon.json` includes Megas, Palafin-Hero and similar formes, and
  `battleOnly` names the forme each one changes from. Cosmetic formes are dropped and listed
  in `cosmeticFormes` on the base species.
- **Spreads:** Champions uses Stat Points rather than EVs, written as `Nature:HP/Atk/Def/SpA/SpD/Spe`.
- **New regulation:** when one starts, update `SHOWDOWN.commit` and `REGULATION` in `config.js`.
  Showdown's `champions` mod always tracks the current regulation.
