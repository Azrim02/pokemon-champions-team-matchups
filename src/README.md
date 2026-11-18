# Matchup modules

Browser-safe ESM shared by the dashboard (no Node built-ins, no I/O). The caller loads
`data/*.json` and the usage summary and passes them in.

```js
import { createDataset, parseTeam, topThreats, calcMatchup, speedTiers, teamDefense } from './src/index.js';

const dataset = createDataset({ pokemon, items, moves, abilities, learnsets, typechart }); // data/*.json
const myTeam = parseTeam(pasteText);
const opponents = topThreats(usageSummary, dataset, { n: 20 }).map(t => t.sets[0]);
const calcs = calcMatchup(myTeam, opponents, dataset, { weather: 'Sun', oppSide: { isTailwind: true } });
```

| Module | What it does |
| --- | --- |
| `data.js` | Lookups over the exported JSON (`getPokemon`, `canLearn`, `megaFormeFor`…), Stat Point limits |
| `team.js` | Parse and export Showdown / Pokepaste text (Stat Points on `EVs:` or `SPs:`), and validate a team against M-C: legality, learnsets, 32/66 Stat Points, Species and Item Clause |
| `calc.js` | `@smogon/calc` Champions mechanics (gen 0). `calcMatchup` gives raw calc lists for every pairing, both directions: damage and % range, all 16 rolls, KO chance, description |
| `speed.js` | Final Speed and speed tiers using the calc's own Speed rules (Tailwind, Scarf, paralysis, weather abilities, Trick Room order) |
| `typeMatrix.js` | Team defensive matrix (including immunity and resistance abilities) and offensive coverage against opponents |
| `opponents.js` | Likely opponent sets from the usage summary: top item, ability and moves, plus the top N spreads |

## Conventions

- **Sets** use Showdown's `PokemonSet` shape, with Stat Points in `evs`. Battle state is optional,
  in `set.state = { boosts, status, curHPPct, abilityOn, mega }`.
- **Megas:** a set holding its Mega Stone is calc'd as the Mega forme, unless `state.mega === false`.
  Usage stats list Megas by their Mega name; `opponents.js` registers them as the base forme
  holding the stone.
- **Conditions** default to Doubles, so spread moves get the 0.75× reduction. `mySide` and
  `oppSide` are swapped automatically when the opponent is attacking.
- **Likely sets** combine the most common item, ability, spread and moves, each taken separately
  (usage stats don't give whole sets). `set.usage` holds the percentages behind each guess.
- **Calc data:** `@smogon/calc` ships its own copy of the data. `test/calc-parity.test.js` checks
  that it matches our export. The only difference so far is the name Aegislash, handled by an
  alias in `calc.js`.
