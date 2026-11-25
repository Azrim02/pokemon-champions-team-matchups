# Team findings — Metagross / Rillaboom / Primarina

**Date:** 26 Nov 2026 · **Format:** Reg M-C, Doubles only · **Style:** balance, Tailwind, no repeated types
**Team:** `web/src/teams/metagross-primarina.txt` (the dashboard default; how to play it is in the Play tab)
**Replaces:** `metagross-salamence-findings.md`, whose team repeats Dragon and Water
**Full records:** `tools/doubles-sim/results/` (`GAUNTLET.md`, `FINAL.md`) · **Status:** simulated, not tested on the ladder

## Team

Metagross (Ice Punch), Rillaboom, Garchomp, Volcarona, Tyranitar (Chople Berry), Primarina. Eleven types, none
repeated; every weakness is resisted by a teammate. Volcarona sets Tailwind and redirects, Rillaboom has Fake Out and
U-turn. No pair or trio covers all of its own weaknesses, so the cover comes from the whole team.

## Gauntlet

Full 4v4 Doubles games in Showdown's engine. Every team played the same opponents with the same seeds. The **fresh**
opponents were used by nothing else and decide; the earlier ones are for comparison (teams were selected on some of them).

| Team | Fresh usage (150 × 8) | Fresh archetypes (130 × 8) | Earlier usage (300 × 3) | Earlier archetypes (260 × 3) | Repeated types |
|---|---|---|---|---|---|
| **Primarina (final)** | **70.0 ± 1.7** | **65.2 ± 1.8** | 66.4 ± 1.7 | 66.0 ± 1.9 | none |
| Revised (Focus Sash Tyranitar) | 68.4 ± 1.8 | 64.3 ± 1.8 | 71.6 ± 1.7 | 70.9 ± 1.8 | none |
| Focus Sash Basculegion | 70.8 ± 1.6 | 61.0 ± 2.0 | 66.4 ± 1.6 | 63.6 ± 1.9 | none |
| Ice Punch Tyranitar | 68.4 ± 1.7 | 61.8 ± 2.1 | 64.7 ± 1.6 | 65.9 ± 1.8 | none |
| Life Orb Basculegion | 66.6 ± 1.9 | 61.0 ± 2.0 | 66.2 ± 1.7 | 60.8 ± 2.0 | none |
| Mystic Water Basculegion | 66.6 ± 1.6 | 61.3 ± 1.9 | 64.4 ± 1.8 | 61.7 ± 1.9 | none |
| Original (first-pass winner) | 61.8 ± 2.0 | 58.0 ± 2.1 | 63.0 ± 1.9 | 58.1 ± 1.9 | none |
| Salamence | 58.9 ± 2.1 | 57.5 ± 2.1 | 60.4 ± 1.8 | 58.2 ± 1.9 | Dragon, Water |
| Kommo-o / Tailwind | 52.8 ± 1.9 | 46.2 ± 2.1 | 52.2 ± 1.9 | 47.4 ± 2.0 | Fairy |
| Hydreigon / Talonflame | 48.5 ± 1.9 | 46.7 ± 2.2 | 49.0 ± 1.9 | 47.7 ± 1.8 | none |

Final team minus each rival, paired by opponent on the fresh sets: original **+7.8 ± 1.7**, Salamence **+9.5 ± 1.7**,
Life Orb Basculegion +3.8 ± 1.5, Ice Punch Tyranitar +2.4 ± 1.6, Focus Sash Basculegion +1.5 ± 1.5,
revised +1.3 ± 1.5.

## Why not the revised team

The revision (19 single changes, then 15 combinations) found one change that gained about 3 points twice: a fast Focus
Sash Tyranitar. It held on the opponents it was chosen on (71.6 and 70.9) but not on fresh ones (1.3 ± 1.5 behind).
The rule, set before the gauntlet, was that fresh opponents decide. The two teams are close, so Focus Sash Tyranitar is
a reasonable alternative to try.

## By archetype (fresh, 10 teams × 8 games, so single rows are rough)

| Strong | Weak |
|---|---|
| Screens 76%, sun 74%, sand 74%, Trick Room 71%, snow 70% | Rain 51%, Metagross mirror 55%, redirection 60%, Fake Out balance 61%, Psychic Terrain 61% |

## Dashboard check

Against the top 40 in Grassy Terrain, the team has 28 safe KOs (a guaranteed OHKO by a member that is faster or isn't
OHKOed back), fewer than the Salamence team's 35. It wins more simulated games all the same, because that count leaves
out Fake Out, Tailwind, redirection and Protect. No safe KO on Kingambit, Rillaboom, Incineroar, Archaludon,
Indeedee-F, Mega Dragonite, Pelipper, Sylveon, Grimmsnarl, Alolan Ninetales, Sinistcha or Mega Metagross.

## What was learned

- **Ice Punch over Iron Head** was better in every pass (Iron Head −3.2 ± 1.6 in the revision). The cost: no
  super-effective attack against Fairies.
- **The first-pass lead was an artefact.** Early opponent sets had Sneasler on about 85% of teams (50% on the ladder).
- **Best-of-many is always too high.** Several leaders fell by 5 points or more when retested, including the revision.

## Limits

- Both sides are played by the same AI, which is weaker than a good player and sees both teams' sets. Win rates compare
  teams; they don't forecast the ladder.
- Opponents are sampled or rule-built, and Perish Song trap isn't included.
- Reg M-C only. No Reg M-D games have been run.
