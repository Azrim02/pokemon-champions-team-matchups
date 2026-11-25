# Team revision findings — Mega Metagross + Rillaboom

**Date:** 25 Nov 2026 · **Formats:** Reg M-C (until 2 Dec 2026) and Reg M-D (from 2 Dec 2026)
**Asked for:** balance, Tailwind, two versions (playable now and M-D); only Metagross and Rillaboom fixed
**Revises:** `metagross-rillaboom-regmd-team.md`, which has the M-D sources and the assumed M-D sets
**Teams:** `web/src/teams/metagross-salamence.txt` (M-C) and `metagross-salamence-regmd.txt` (M-D)
**Status:** calculated, not tested in battle

## Result

Salamence and Primarina replace Sneasler and Milotic, and Hydreigon changes from a Tailwind setter to a bulkier attacker. The sixth slot is Basculegion now and Heatran for M-D.

| Measure | Old team | New team |
|---|---|---|
| Search score, M-C opponents | 85.63 (with Basculegion as the sixth) | **88.93** |
| Search score, M-D opponents, Heatran version | 83.81 | **86.94** |
| Dashboard: safe KOs on the top 40, no terrain | 32 (with Basculegion) | **33** |
| Dashboard: safe KOs on the top 40, Grassy Terrain | 33 (with Basculegion) | **35** |
| Dashboard: hit for 50%+ without being KOed back | 39 | 39 |
| Dashboard: complete defensive cores | 2 (with Basculegion) | **3** |

- **The search score gap is clear:** about 3 points, against a spread of about 0.2 between opponent samples. **The dashboard gap is small:** one or two KOs.
- "Safe KO" means a guaranteed OHKO by a member that is faster, or that isn't OHKOed back.
- The old team has an illegal Pokémon (Heatran) in M-C, so Basculegion stands in for it in the M-C and dashboard rows.

## The teams

```
Metagross @ Metagrossite
Ability: Clear Body
EVs: 2 HP / 32 Atk / 32 Spe
Jolly Nature
- Psychic Fangs
- Iron Head
- Stomping Tantrum
- Protect

Rillaboom @ Miracle Seed
Ability: Grassy Surge
EVs: 28 HP / 32 Atk / 6 Spe
Adamant Nature
- Fake Out
- Grassy Glide
- Wood Hammer
- U-turn

Salamence @ Sitrus Berry
Ability: Intimidate
EVs: 20 HP / 32 SpA / 14 Spe
Modest Nature
- Draco Meteor
- Flamethrower
- Tailwind
- Protect

Hydreigon @ Life Orb
Ability: Levitate
EVs: 20 HP / 32 SpA / 14 Spe
Modest Nature
- Dark Pulse
- Draco Meteor
- Flamethrower
- Protect

Primarina @ Leftovers
Ability: Liquid Voice
EVs: 32 HP / 2 Def / 32 SpA
Modest Nature
- Hyper Voice
- Moonblast
- Haze
- Protect
```

Sixth, M-C version:

```
Basculegion @ Mystic Water
Ability: Adaptability
EVs: 12 HP / 32 Atk / 10 Def / 12 Spe
Adamant Nature
- Wave Crash
- Last Respects
- Aqua Jet
- Protect
```

Sixth, M-D version (learnset assumed):

```
Heatran @ Shuca Berry
Ability: Flash Fire
EVs: 32 HP / 32 SpA / 2 Spe
Modest Nature
- Heat Wave
- Earth Power
- Flash Cannon
- Protect
```

The M-C team passes the repo's validator. In the M-D team only Heatran fails, because it isn't in the data yet.

## Why each change

| Change | Reason |
|---|---|
| Sneasler → Salamence | Intimidate and Tailwind in one slot, and it resists Fire, which both core members are weak to. It appears in 15 of the 20 best joint-search results |
| Milotic → Primarina | Keeps Haze, adds damage, and is immune to Dragon. Moonblast KOs Garchomp, Kommo-o, Mega Salamence and Mega Tatsugiri |
| Hydreigon: no Tailwind, Flamethrower added | Salamence sets Tailwind now. Flamethrower does 78–92% to Kingambit and 92–109% to Rillaboom |
| Basculegion in M-C | Wave Crash KOs Incineroar, Volcarona and Armarouge. It lifted safe KOs from 30 to 33 over the same five without a sixth |
| Iron Head kept over Ice Punch | Ice Punch scored 0.2 to 0.3 higher in the search (M-C opponents), but the dashboard lost safe KOs on Mega Floette, Sylveon, Grimmsnarl and Alolan Ninetales (29 vs 33) |
| Jolly kept over Adamant | Adamant scored about 0.2 higher in the search on Ice Punch sets. Jolly's 178 Speed beats Adamant Sneasler (172), the most used Pokémon |
| U-turn over High Horsepower | Fits balance. High Horsepower scored 0.3 to 0.6 higher, so it's the first alternative to try |

## Key damage

Min–max % of HP, Grassy Terrain up, against the likely M-C sets and the assumed M-D sets.

| Attacker | Move | Target | Damage |
|---|---|---|---|
| Metagross | Psychic Fangs | Sneasler / Mega Staraptor | 392–466 / 109–130 |
| Metagross | Stomping Tantrum | Mega Heatran / Mega Raichu Y | 117–139 / 102–120 |
| Metagross | Iron Head | Mega Floette / Mega Gardevoir / Sylveon | 118–139 / 141–167 / 104–123 |
| Hydreigon | Dark Pulse | Farigiraf / Indeedee-F / Gholdengo / Basculegion | 108–129 / 101–120 / 121–144 / 123–144 |
| Hydreigon | Flamethrower | Mega Golisopod | 134–160 |
| Salamence | Draco Meteor | Garchomp / Kommo-o / Mega Tatsugiri | 134–159 / 119–140 / 126–149 |
| Primarina | Moonblast | Garchomp / Kommo-o / Mega Salamence / Mega Tatsugiri | 108–128 / 190–226 / 112–133 / 101–120 |
| Basculegion | Wave Crash | Incineroar / Volcarona / Armarouge | 162–192 / 197–234 / 205–243 |

Speeds: Metagross 178, Salamence 134, Hydreigon 132, Rillaboom 111, Basculegion 110, Heatran 99, Primarina 80.

## Defensive cores

From the dashboard's core graph, every weakness in these trios is covered:

- Metagross + Salamence + Hydreigon
- Metagross + Hydreigon + Primarina
- Metagross + Hydreigon + Basculegion (M-C version)

Salamence and Hydreigon are both weak to Dragon, Fairy and Ice (Salamence 4× Ice, Hydreigon 4× Fairy). Metagross resists all three; Primarina is immune to Dragon and resists Ice. Don't bring both Dragons without Metagross or Primarina.

## Dondozo plan

1. Lead Rillaboom and Primarina.
2. Fake Out on Dondozo plus Haze. Haze works through Protect; Fake Out fails in Psychic Terrain.
3. Wood Hammer.

| Dondozo | Wood Hammer at +2 | Wood Hammer after Haze | Wave Crash (+2) into Primarina |
|---|---|---|---|
| Adamant 32 HP / 32 Atk | 59–71 | 119–140 | 63–74 |
| Adamant 32 HP / 32 SpD | 59–71 | 119–140 | 50–59 |
| Impish 32 HP / 32 Def | 44–52 | 87–104 | 46–55 |

## Leads

| Opponent | Lead | Back |
|---|---|---|
| Default | Rillaboom + Salamence (Fake Out + Tailwind) | Metagross, Primarina |
| Physical attackers | Salamence + Metagross | Hydreigon, Rillaboom |
| Psychic Terrain | Hydreigon + Metagross | Primarina, Salamence |
| Sun or Fire | Salamence + Basculegion (M-C) or Heatran (M-D) | Primarina, Hydreigon |
| Dondozo | Rillaboom + Primarina | Metagross, Hydreigon |

These are judgement, not search output.

## What is still weak

- **No safe KO in the dashboard, even in Grassy Terrain:** Kingambit, Archaludon, Mega Dragonite, Sinistcha and opposing Mega Metagross. Without terrain, also Mega Raichu X and Mega Tyranitar.
- **Kingambit** is the main cost of dropping Sneasler (Close Combat did 94–111%). Plan two hits: Hydreigon Flamethrower 78–92% plus any follow-up. Kowtow Cleave does 74–89% to Metagross.
- **Mega Dragonite:** best hits are Salamence's Draco Meteor (48–57) and Hydreigon's (68–80).
- **Heatran isn't proven better than Basculegion in M-D.** Against M-D opponents Basculegion scored 87.29 and Heatran 86.94, a gap close to the noise. Heatran's case is its type cover: it resists Fairy, Ice and Dragon, and is immune to Fire.

## Method

1. **Sets:** 512 legal variants of 31 species plus Heatran (items, Stat Points, moves), from the dataset's learnsets.
2. **Opponents:** the 40 most used Pokémon in `data/usage/2026-10` (likely sets), plus two +2 Dondozo, Mega Heatran and Mega Tatsugiri with assumed sets and guessed usage.
3. **Duels:** the repo's calc, mean rolls, Speed, priority and setter weather, over five conditions: no terrain, Grassy Terrain, own Tailwind, opposing Tailwind, and opposing Intimidate. A win in two hits or fewer counts most.
4. **Team score:** the best four of six against 350 sampled opponent teams, minus a penalty for uncovered or stacked weaknesses. Teams needed Tailwind, Haze, two pivots or Intimidate users, and three Protects.
5. **Search:** hill climbing from random starts, both versions together (504 starts over four seeds).
6. **Validation:** finalists rescored on six opponent samples the search didn't use (the scores above are those means, before penalties), then compared in the real dashboard with top 40 and weather from setters.

Fixed along the way: two early errors gave wrong rankings. Electro Shot counted as one turn without rain, which put Archaludon on every top team, and Focus Sash counted as fully reliable.

## Limits

- Duels are one on one. Fake Out, Protect, redirection, Haze, pivots and double targeting aren't modelled, so support Pokémon (Incineroar, Whimsicott, Milotic) are undervalued.
- Set variants were hand-picked, not exhaustive, and differences under about 0.5 points mean little.
- Likely sets combine the top item, spread and moves separately, so some opponent sets are unrealistic.
- M-D usage, Mega stats and Heatran's and Dondozo's sets are assumptions. Rerun after 2 December with real data.
