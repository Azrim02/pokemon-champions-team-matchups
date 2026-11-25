# Doubles simulator

Compares Reg M-C teams by playing full 4v4 Doubles games in Pokémon Showdown's engine
(`vendor/pokemon-showdown`, set up by `npm run setup:showdown`). Nothing is trained: it is a
search AI plus a team search.

```sh
./start.sh             # start or resume in the background (survives closing the terminal)
./progress.sh          # live progress bar (--once for one print)
systemctl --user stop doubles-sim      # stop; ./start.sh resumes from the last checkpoint
cat results/RESULTS.md                 # written when the run completes
SMOKE=1 node run.mjs   # tiny run of every stage, to check that nothing crashes
```

`THREADS=4 ./start.sh` uses less memory. To start over, delete `results/state.json`.

| File | What it does |
|---|---|
| `ai.cjs` | The player. Read in this order: `damage`, `turn` (abstract Doubles turn), `greedy` + `roll` (rollouts), `options`, `decide`, `preview`, `play` |
| `pool.cjs` | Runs games on worker threads |
| `sets.mjs` | Candidate sets (illegal ones are dropped) |
| `opp.mjs` | Samples opponent teams from Smogon usage: `node opp.mjs <seed> <count> <file>` |
| `check-ai.cjs` | Win rate of the AI against weaker and deeper versions of itself |
| `check-damage.mjs` | The AI's damage estimate against `@smogon/calc` |

## How a turn is chosen

1. List each Pokémon's moves, targets and switches, and combine them into joint actions.
2. Predict the opponent's best replies.
3. Play the 14 best joint actions against those replies in the abstract model, then two more
   greedy turns, and take the best mix of average and worst case, with a little noise.

The abstract model covers Fake Out flinches, Protect, priority, Speed and Tailwind, Trick Room,
redirection, Wide Guard, Intimidate, pivots, spread damage, terrain, screens and healing. It only
decides moves: results come from Showdown's engine.

## Passes

| Script | What it does | Writes |
|---|---|---|
| `run.mjs` | 1. Teams with Metagross, Rillaboom, no repeated type, no uncovered weakness, Tailwind and a support Pokémon: 420 play, then 110, then 30; then set changes and swaps | `results/RESULTS.md` |
| `refine.mjs` | 2. Swaps and set variants around the winner, with every team-preview choice considered (`PREVIEW=full`) | `results/REFINED.md` |
| `final.mjs` | 3. Reranks on usage-matched and archetype opponents, then validates on held-out sets | `results/FINAL.md` |
| `revise.mjs` | 4. Single changes to the best team, then combinations | `results/revise-state.json` |
| `gauntlet.mjs` | Every paste in `gauntlet/*.txt` against the same opponents and seeds | `results/GAUNTLET.md` |

**Passes 1 and 2 are biased.** Opponent sets A to E over-represent common Pokémon (Sneasler on about 85% of teams,
50% on the ladder). Their first-pass winner looked 4 points better than the Salamence team there, and was level with
it on fair opponents. Trust `FINAL.md` and `GAUNTLET.md`.

Opponents in `data/`: `oppF` to `oppI` match ladder usage (`CALIBRATE=1 node opp.mjs …`); `oppArch*` are 13 archetypes
with 10 teams each (`ARCH=1 node opp.mjs …`); `oppMD` is a guessed Reg M-D set (`opp-md.mjs`, run games with `MD=1`),
not used yet.

`sample.mjs` adds sample wins for one team. `guide.mjs` turns a team's fresh gauntlet results and `guide-notes.json` (hand-written advice) into the dashboard's
Play tab data: `node guide.mjs <gauntlet file> <team id>`.

## Limits

- The AI sees both teams' full sets and is weaker than a good player.
- Opponent teams are sampled from usage or built from archetype rules, not copied from real teams. Perish Song trap
  is missing, because the AI can't play it.
- The shortlist comes from a type-coverage score, and the candidate sets were hand-picked.
- Reg M-C only: no Dondozo, Tatsugiri or Mega Heatran yet.
