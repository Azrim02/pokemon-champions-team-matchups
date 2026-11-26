# Metagross / Whimsicott / Volcarona (Reg M-C)

Team: `web/src/teams/metagross-whimsicott-tailwind.txt` (the dashboard default). Play guide:
`web/src/plays/metagross-whimsicott-tailwind.json`. Games come from `tools/doubles-sim` (see its README for
the AI and its limits).

## Brief

Build around Mega Metagross, Rillaboom and Hydreigon, with Whimsicott as the Tailwind setter and a spread
damager (Volcarona first) to soften opponents. Whimsicott (Grass/Fairy) and Rillaboom (Grass) repeat Grass;
that was accepted because both were asked for.

| Pokémon | Item | Moves |
|---|---|---|
| Metagross | Metagrossite | Psychic Fangs, Ice Punch, Stomping Tantrum, Protect |
| Rillaboom | Miracle Seed | Fake Out, Grassy Glide, Wood Hammer, High Horsepower |
| Hydreigon | Life Orb | Dark Pulse, Draco Meteor, Earth Power, Protect |
| Whimsicott | Focus Sash | Tailwind, Moonblast, Encore, Protect |
| Volcarona | Grassy Seed | Quiver Dance, Heat Wave, Bug Buzz, Protect |
| Milotic | Sitrus Berry | Scald, Icy Wind, Ice Beam, Protect |

## How it was chosen

All rounds used the gauntlet's fresh opponents (150 usage-matched teams and 130 archetype teams, 8 games
each, same seeds for every team). Differences are paired by opponent; ± is one standard error.

1. **Slots 5 and 6** with the four fixed Pokémon. Win % on usage / archetypes:

   | Slots 5 + 6 | Usage | Archetypes |
   |---|---|---|
   | Volcarona + Milotic | 62.4 | 57.8 |
   | Volcarona + Glimmora | 57.8 | 53.9 |
   | Volcarona + Rotom-Wash | 56.3 | 51.7 |
   | Volcarona + Rotom-Wash (Electroweb) | 55.8 | 52.5 |
   | Arcanine-Hisui (Rock Slide) + Rotom-Wash | 53.7 | 48.8 |
   | Volcarona (Charcoal, Giga Drain) + Rotom-Wash | 52.4 | 50.7 |
   | Chandelure (Heat Wave) + Rotom-Wash | 49.5 | 46.1 |

   Volcarona was the best spread damager, and a second spread move (Milotic's Icy Wind / Muddy Water) helped:
   Milotic beat Rotom-Wash by 6.1 ± 1.6.

2. **Single changes** to Volcarona + Milotic. None was clearly better on its own. The best: Ice Punch on
   Metagross (+2.2 ± 1.6), High Horsepower on Rillaboom (+1.8 ± 1.4), Scald on Milotic (+1.0 ± 1.5), Earth Power
   on Hydreigon (+0.9 ± 1.3). Light Screen or Helping Hand on Whimsicott changed nothing; Rage Powder or
   Struggle Bug on Volcarona and Snarl on Hydreigon were worse.

3. **Combinations.** All four changes together beat the base by 3.9 ± 1.7; smaller combinations did not.

## Gauntlet

From `tools/doubles-sim/results/GAUNTLET.md` (same opponents and seeds for every team):

| Team | Fresh usage | Fresh archetypes | Earlier usage (F, H) | Earlier archetypes |
|---|---|---|---|---|
| Metagross / Whimsicott / Volcarona | 64.5 ± 1.9 | 63.7 ± 1.9 | 64.7 ± 1.7 | 64.5 ± 1.9 |
| Primarina (best saved M-C team) | 70.0 ± 1.7 | 65.2 ± 1.8 | 66.4 ± 1.7 | 66.0 ± 1.9 |
| Hydreigon / Volcarona (previous default) | 58.8 ± 2.0 | 61.1 ± 2.2 | 61.2 ± 1.8 | 63.6 ± 1.9 |

- The team was picked on the fresh sets, so those numbers are a little optimistic. The earlier sets played no
  part in its choice, so they are its held-out check: 64.7 and 64.5.
- It beats the previous default and is close to, but not better than, the Primarina team (about 1.6 points
  behind on the held-out sets, 3.5 on the fresh sets).
- Strongest archetypes: Sand 71, Trick Room 71, Psychic Terrain 69, Mega Flying Tailwind 68, Tailwind
  offense 68. Weakest: Fake Out balance 53, Sun 58, Rain 58.
- Most used leads: Milotic + Whimsicott (61% won), Metagross + Milotic (72%), Metagross + Rillaboom (71%).

## Weak points

- Fire hits Metagross, Rillaboom and Whimsicott; Milotic, Volcarona and Hydreigon resist it.
- Poison hits Whimsicott 4× and Rillaboom 2×; only Metagross is immune.
- Rock hits Volcarona 4×.
- The two Grass types share the Flying and Ice weaknesses.
