# Mega Metagross + Rillaboom — Reg M-D draft

**Format:** Pokémon Champions · Doubles · Reg M-D (2 Dec 2026 – 3 Mar 2027) · Lv 50
**Built:** 25 Nov 2026, before M-D launched. **Status:** draft, untested in battle
**Basis:** M-C usage (`data/usage/2026-10`, 1760 cutoff), the repo's calc (`@smogon/calc`, Champions mechanics), and M-D news
**Relation to older sheets:** keeps Metagross, Rillaboom, Hydreigon and Sneasler from `metagross-hydreigon-talonflame-team.md`; Heatran and Milotic replace Talonflame and Rotom-Wash

## What is confirmed, and what is not

| Claim | Status |
|---|---|
| M-D runs 2 Dec 2026, 6:00 p.m. PST – 3 Mar 2027, 5:59 p.m. PST; previously eligible Pokémon stay eligible | [Official](https://www.pokemon.com/us/news/regulation-set-m-d-is-coming-to-pokemon-champions) |
| 24 Pokémon and four Megas added, including Heatran, Dondozo and Tatsugiri; Mega Heatran and Mega Tatsugiri | Official. The other 21 Pokémon and two Megas weren't named in the pages read |
| Mega Heatran: Water Compaction (+2 Def when hit by a Water move) | [Serebii](https://www.serebii.net/news/2026/25-November-2026.shtml) |
| Mega Tatsugiri: +1 SpA on entry | Official (ability name not given) |
| Balance patch: Rock Slide to 95% accuracy and 20% flinch; Flash Fire now grants Fire Boost, which persists through Mega Evolution | [Official](https://www.pokemon.com/us/news/pokemon-champions-balance-patch-update-december-2026). Doesn't name Rillaboom, Grassy Glide or Metagross |
| Base stats of both new Megas | **Assumed** from Legends: Z-A; Champions may differ |
| Heatran's Champions learnset and Dondozo's and Tatsugiri's sets | **Assumed** from Scarlet/Violet |

## The team

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

Heatran @ Shuca Berry
Ability: Flash Fire
EVs: 32 HP / 32 SpA / 2 Spe
Modest Nature
- Heat Wave
- Earth Power
- Flash Cannon
- Protect

Hydreigon @ Life Orb
Ability: Levitate
EVs: 2 HP / 32 SpA / 32 Spe
Modest Nature
- Dark Pulse
- Draco Meteor
- Tailwind
- Protect

Sneasler @ Grassy Seed
Ability: Unburden
EVs: 2 HP / 32 Atk / 32 Spe
Adamant Nature
- Close Combat
- Dire Claw
- Rock Slide
- Protect

Milotic @ Sitrus Berry
Ability: Competitive
EVs: 32 HP / 32 SpA / 2 SpD
Modest Nature
- Scald
- Ice Beam
- Haze
- Recover
```

Everything except Heatran passes the repo's M-C validator. Heatran isn't in the dataset yet, so its set is unvalidated.

## Roles

| Pokémon | Speed | Job |
|---|---|---|
| Mega Metagross | 178 | Main attacker. Jolly outspeeds a +2 max-Speed Adamant Dondozo (174), but not a Jolly one (190) |
| Rillaboom | 111 | Terrain, Fake Out, priority. 6 Spe is one point above an uninvested +2 Dondozo (110) |
| Heatran | 99 | Immune to Fire, the type that hits both core members for 2×. Grassy Terrain halves Earthquake |
| Hydreigon | 150 | Resists Fire, Ghost and Dark, immune to Ground. The only Tailwind |
| Sneasler | 172 (344 with Unburden) | Breaks Dark types, Mega Charizard Y and Volcarona |
| Milotic | 101 | Haze for Dondozo, Ice Beam for Dragons, Competitive against Intimidate |

## Key damage

Damage is min–max % of HP. Grassy Terrain is up unless noted. Targets are the most common M-C sets; new M-D targets use the assumed sets below.

| Attacker | Move | Target | Damage |
|---|---|---|---|
| Metagross | Stomping Tantrum | Mega Heatran | 117–139 |
| Metagross | Stomping Tantrum | Mega Heatran after Water Compaction (+2 Def) | 59–71 |
| Metagross at −1 Atk | Stomping Tantrum | Mega Heatran | 79–93 |
| Metagross | Psychic Fangs | Sneasler | 392–466 |
| Metagross | Iron Head | Mega Floette / Mega Gardevoir / Sylveon | 118–139 / 141–167 / 104–123 |
| Rillaboom | Wood Hammer | Mega Tatsugiri | 128–152 |
| Rillaboom | Wood Hammer | Basculegion | 178–210 |
| Heatran | Heat Wave | Gholdengo | 86–103 |
| Hydreigon | Dark Pulse | Farigiraf / Indeedee-F / Gholdengo | 108–129 / 101–120 / 121–144 |
| Hydreigon | Draco Meteor | Archaludon / Mega Salamence | 91–108 / 195–231 |
| Sneasler | Rock Slide | Mega Charizard Y (sun, no terrain) | 93–110 |
| Sneasler | Rock Slide | Volcarona | 86–102 |
| Sneasler | Close Combat | Kingambit (Chople Berry) / Incineroar | 94–111 / 113–134 |
| Milotic | Ice Beam | Garchomp / Mega Salamence / Mega Garchomp Z | 117–138 / 121–144 / 58–69 |

Assumed new sets: Mega Heatran Modest 32 HP / 32 SpA; Mega Tatsugiri Modest 32 SpA / 32 Spe at +1 SpA; Dondozo at +2 in every stat with Unaware and Leftovers.

## Dondozo + Tatsugiri

1. Bring in a fresh Rillaboom next to Milotic.
2. Fake Out on Dondozo plus Haze in the same turn. If Dondozo Protects, Haze still works.
3. Wood Hammer.

| Dondozo spread | Wood Hammer at +2 | Wood Hammer after Haze | Wave Crash (+2) into Rillaboom | Wave Crash (+2) into Milotic |
|---|---|---|---|---|
| Adamant 32 HP / 32 Atk | 59–71 | 119–140 | 50–60 | 56–67 |
| Adamant 32 HP / 32 SpD | 59–71 | 119–140 | 40–48 | 45–53 |
| Impish 32 HP / 32 Def | 44–52 | 87–104 | 37–44 | 42–49 |

- Fake Out fails in Psychic Terrain. Without it, Dondozo moves before Milotic's Haze; Milotic survives one Wave Crash.
- Max-Defense sets aren't a reliable two-hit KO without Haze, because Dondozo also heals from Leftovers and Grassy Terrain. Even after Haze, one Wood Hammer isn't guaranteed.

## Other M-D threats

- **Mega Heatran:** Metagross is faster and KOs it. Mega Heatran's Heat Wave does 97–116% back, so don't let it move first. Don't Scald it before Metagross attacks.
- **Mega Tatsugiri:** Rillaboom's Wood Hammer KOs it. Its +1 Draco Meteor does 241–285% to Hydreigon.

## Leads

| Opponent | Lead | Back |
|---|---|---|
| Default | Rillaboom + Metagross | Heatran, Hydreigon |
| Dondozo | Rillaboom + Milotic | Metagross, Hydreigon |
| Sun or Fire | Rillaboom + Sneasler | Heatran, Milotic |
| Psychic Terrain | Hydreigon + Metagross | Heatran, Rillaboom |

## Weakness check

Includes Levitate and Flash Fire; doesn't include terrain or berries.

| Type | Metagross | Rillaboom | Heatran | Hydreigon | Sneasler | Milotic |
|---|---|---|---|---|---|---|
| Normal | ½ | 1 | ½ | 1 | 1 | 1 |
| Grass | ½ | ½ | ¼ | ½ | ½ | **2** |
| Fire | **2** | **2** | 0 | ½ | 1 | ½ |
| Water | 1 | ½ | **2** | ½ | 1 | ½ |
| Electric | 1 | ½ | 1 | ½ | 1 | **2** |
| Ice | ½ | **2** | ¼ | **2** | 1 | ½ |
| Flying | ½ | **2** | ½ | 1 | **2** | 1 |
| Bug | 1 | **2** | ¼ | **2** | ¼ | 1 |
| Poison | 0 | **2** | 0 | 1 | ½ | 1 |
| Ground | **2** | ½ | **4** | 0 | **2** | 1 |
| Rock | ½ | 1 | 1 | 1 | ½ | 1 |
| Fighting | 1 | 1 | **2** | **2** | ½ | 1 |
| Psychic | ¼ | 1 | ½ | 0 | **4** | 1 |
| Ghost | **2** | 1 | 1 | ½ | 1 | 1 |
| Dragon | ½ | 1 | ½ | **2** | 1 | 1 |
| Dark | **2** | 1 | 1 | ½ | ½ | 1 |
| Steel | ½ | 1 | ¼ | 1 | 1 | ½ |
| Fairy | ½ | 1 | ¼ | **4** | 1 | 1 |

## Weak points

- **Ground:** three members are weak. Choice Scarf Garchomp's Stomping Tantrum does 68–82% to Heatran through Shuca Berry, and Grassy Terrain doesn't halve it.
- **Mega Dragonite:** the best hit is Draco Meteor (68–80). Ice Punch over Iron Head gives Metagross 57–67, but gives up Metagross's Fairy KOs.
- **Mega Charizard Y:** Heat Wave in sun does 138–162% to Metagross. Heatran's immunity doesn't protect its partner.
- **Speed control:** Hydreigon's Tailwind has no priority.

## After 2 December

1. Check the in-game roster, the two unnamed Megas, and Heatran's learnset.
2. Update `SHOWDOWN.commit` and `REGULATION` in `pipeline/config.js`, then run `npm run data`.
3. Check that `@smogon/calc` has Champions data for the new Pokémon, then recheck the rolls here. The team is in `web/src/teams/metagross-rillaboom-regmd.txt`; until the data has Heatran, the dashboard flags it and leaves it out of the matchups.
