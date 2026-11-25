# Doubles search results

Written 2026-11-25T07:14:55.253Z by `tools/doubles-sim/run.mjs`.

Reg M-C only: full 4v4 Doubles games in Showdown's engine, against sampled usage teams. 24739 teams had no repeated type and no uncovered weakness; 420 played. Win rates below are on 100 opponent teams the search never saw (± one standard error).

| Team | Win rate | Repeated types | Uncovered weaknesses |
|---|---|---|---|
| 1. Metagross, Rillaboom, Garchomp, Volcarona, Tyranitar, Basculegion | 62.2 ± 1.5 | 0 | 0 |
| 2. Metagross, Rillaboom, Garchomp, Volcarona, Tyranitar, Basculegion | 59.9 ± 1.5 | 0 | 0 |
| 3. Metagross, Rillaboom, Garchomp, Volcarona, Tyranitar, Basculegion | 58.4 ± 1.6 | 0 | 0 |
| 4. Metagross, Rillaboom, Dragapult, Volcarona, Tyranitar, Azumarill | 58.3 ± 1.6 | 0 | 0 |
| 5. Metagross, Rillaboom, Hydreigon, Volcarona, Azumarill, Glimmora | 57.8 ± 1.6 | 0 | 0 |
| 6. Metagross, Rillaboom, Garchomp, Volcarona, Tyranitar, Basculegion | 57.6 ± 1.6 | 0 | 0 |
| 7. Metagross, Rillaboom, Dragapult, Volcarona, Tyranitar, Azumarill | 57.4 ± 1.6 | 0 | 0 |
| 8. Metagross, Rillaboom, Hydreigon, Volcarona, Azumarill, Glimmora | 56.1 ± 1.6 | 0 | 0 |
| Existing: metagross-salamence | 57.3 ± 1.6 | 2 | 0 |
| Existing: metagross-hydreigon-talonflame | 43.2 ± 1.6 | 0 | 0 |
| Existing: metagross-kommoo-tailwind | 48.1 ± 1.6 | 1 | 0 |

## 1. Metagross / Rillaboom / Garchomp / Volcarona / Tyranitar / Basculegion

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

Garchomp @ Soft Sand
Ability: Rough Skin
EVs: 2 HP / 32 Atk / 32 Spe
Jolly Nature
- Dragon Claw
- Rock Slide
- Stomping Tantrum
- Protect

Volcarona @ Rocky Helmet
Ability: Flame Body
EVs: 32 HP / 16 Def / 8 SpA / 10 Spe
Bold Nature
- Heat Wave
- Struggle Bug
- Tailwind
- Rage Powder

Tyranitar @ Chople Berry
Ability: Sand Stream
EVs: 32 HP / 32 Atk / 2 SpD
Adamant Nature
- Rock Slide
- Knock Off
- Low Kick
- Protect

Basculegion @ Sitrus Berry
Ability: Adaptability
EVs: 32 HP / 32 Atk / 2 SpD
Adamant Nature
- Wave Crash
- Last Respects
- Aqua Jet
- Protect
```

| Pokémon | Brought | Led | Win rate when brought |
|---|---|---|---|
| Volcarona | 87.3% | 53.2% | 61.1% |
| Garchomp | 83.6% | 54.7% | 61.5% |
| Metagross | 76.9% | 36.1% | 61.6% |
| Basculegion | 72.0% | 32.4% | 63.2% |
| Tyranitar | 43.5% | 10.5% | 60.9% |
| Rillaboom | 36.7% | 13.1% | 67.3% |

Most used moves: Garchomp:Protect (1090), Metagross:Protect (1021), Garchomp:Stomping Tantrum (894), Metagross:Psychic Fangs (887), Basculegion:Last Respects (757), Metagross:Iron Head (673), Basculegion:Aqua Jet (623), Garchomp:Dragon Claw (615), Volcarona:Tailwind (600), Basculegion:Protect (582), Metagross:Stomping Tantrum (579), Volcarona:Heat Wave (574), Basculegion:Wave Crash (513), Volcarona:Struggle Bug (497)

Hardest opponents:

- 0.0%: Garchomp @ Garchompite Z, Rillaboom @ Miracle Seed, Sneasler @ White Herb, Kingambit @ Black Glasses, Farigiraf @ Sitrus Berry, Basculegion @ Spell Tag
- 10.0%: Delphox @ Delphoxite, Rillaboom @ Eject Button, Incineroar @ Rocky Helmet, Charizard @ Charizardite Y, Garchomp @ Choice Scarf, Basculegion @ Mystic Water
- 10.0%: Incineroar @ Sitrus Berry, Golisopod @ Golisopite, Sylveon @ Fairy Feather, Sneasler @ White Herb, Farigiraf @ Colbur Berry, Basculegion @ Choice Scarf
- 10.0%: Farigiraf @ Sitrus Berry, Garchomp @ Garchompite, Sneasler @ Focus Sash, Kingambit @ Black Glasses, Rillaboom @ Miracle Seed, Armarouge @ Life Orb
- 10.0%: Rillaboom @ Occa Berry, Garchomp @ Sitrus Berry, Arcanine-Hisui @ Focus Sash, Sneasler @ Psychic Seed, Kingambit @ Chople Berry, Dragonite @ Dragoninite
- 20.0%: Rillaboom @ Miracle Seed, Basculegion @ Choice Scarf, Sneasler @ Grassy Seed, Incineroar @ Chople Berry, Salamence @ Salamencite, Raichu @ Raichunite Y

## 2. Metagross / Rillaboom / Garchomp / Volcarona / Tyranitar / Basculegion

```
Metagross @ Metagrossite
Ability: Clear Body
EVs: 2 HP / 32 Atk / 32 Spe
Jolly Nature
- Psychic Fangs
- Ice Punch
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

Garchomp @ Choice Scarf
Ability: Rough Skin
EVs: 2 HP / 32 Atk / 32 Spe
Adamant Nature
- Dragon Claw
- Rock Slide
- Stomping Tantrum
- Earthquake

Volcarona @ Rocky Helmet
Ability: Flame Body
EVs: 32 HP / 16 Def / 8 SpA / 10 Spe
Bold Nature
- Heat Wave
- Struggle Bug
- Tailwind
- Rage Powder

Tyranitar @ Chople Berry
Ability: Sand Stream
EVs: 32 HP / 32 Atk / 2 SpD
Adamant Nature
- Rock Slide
- Knock Off
- Low Kick
- Protect

Basculegion @ Sitrus Berry
Ability: Adaptability
EVs: 32 HP / 32 Atk / 2 SpD
Adamant Nature
- Wave Crash
- Last Respects
- Aqua Jet
- Protect
```

| Pokémon | Brought | Led | Win rate when brought |
|---|---|---|---|
| Volcarona | 86.6% | 59.5% | 59.4% |
| Garchomp | 86.2% | 59.1% | 58.6% |
| Basculegion | 76.5% | 28.4% | 61.8% |
| Metagross | 73.7% | 29.4% | 60.1% |
| Tyranitar | 40.6% | 11.8% | 58.4% |
| Rillaboom | 36.4% | 11.8% | 61.5% |

Most used moves: Metagross:Protect (945), Metagross:Psychic Fangs (801), Basculegion:Last Respects (730), Basculegion:Protect (712), Basculegion:Aqua Jet (701), Metagross:Stomping Tantrum (674), Garchomp:Dragon Claw (660), Garchomp:Stomping Tantrum (648), Volcarona:Tailwind (608), Volcarona:Heat Wave (596), Metagross:Ice Punch (594), Volcarona:Struggle Bug (545), Basculegion:Wave Crash (520), Tyranitar:Protect (486)

Hardest opponents:

- 0.0%: Venusaur @ Life Orb, Pelipper @ Damp Rock, Golisopod @ Golisopite, Archaludon @ Leftovers, Basculegion-F @ Focus Sash, Sneasler @ Psychic Seed
- 20.0%: Armarouge @ Focus Sash, Pelipper @ Damp Rock, Charizard @ Charizardite Y, Basculegion @ Mystic Water, Garchomp @ Soft Sand, Kingambit @ Chople Berry
- 20.0%: Venusaur @ Focus Sash, Garchomp @ Choice Scarf, Kingambit @ Life Orb, Incineroar @ Chople Berry, Floette-Eternal @ Floettite, Sneasler @ White Herb
- 30.0%: Delphox @ Delphoxite, Rillaboom @ Eject Button, Incineroar @ Rocky Helmet, Charizard @ Charizardite Y, Garchomp @ Choice Scarf, Basculegion @ Mystic Water
- 30.0%: Sneasler @ Electric Seed, Rillaboom @ Miracle Seed, Kingambit @ Life Orb, Incineroar @ Sitrus Berry, Basculegion @ Spell Tag, Charizard @ Charizardite Y
- 30.0%: Incineroar @ Sitrus Berry, Golisopod @ Golisopite, Sylveon @ Fairy Feather, Sneasler @ White Herb, Farigiraf @ Colbur Berry, Basculegion @ Choice Scarf

## 3. Metagross / Rillaboom / Garchomp / Volcarona / Tyranitar / Basculegion

```
Metagross @ Metagrossite
Ability: Clear Body
EVs: 2 HP / 32 Atk / 32 Spe
Jolly Nature
- Psychic Fangs
- Bullet Punch
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

Garchomp @ Choice Scarf
Ability: Rough Skin
EVs: 2 HP / 32 Atk / 32 Spe
Adamant Nature
- Dragon Claw
- Rock Slide
- Stomping Tantrum
- Earthquake

Volcarona @ Rocky Helmet
Ability: Flame Body
EVs: 32 HP / 16 Def / 8 SpA / 10 Spe
Bold Nature
- Heat Wave
- Struggle Bug
- Tailwind
- Rage Powder

Tyranitar @ Chople Berry
Ability: Sand Stream
EVs: 32 HP / 32 Atk / 2 SpD
Adamant Nature
- Rock Slide
- Knock Off
- Low Kick
- Protect

Basculegion @ Sitrus Berry
Ability: Adaptability
EVs: 32 HP / 32 Atk / 2 SpD
Adamant Nature
- Wave Crash
- Last Respects
- Aqua Jet
- Protect
```

| Pokémon | Brought | Led | Win rate when brought |
|---|---|---|---|
| Garchomp | 90.5% | 66.1% | 58.0% |
| Volcarona | 89.0% | 64.4% | 57.3% |
| Basculegion | 75.1% | 23.5% | 57.9% |
| Metagross | 65.3% | 21.9% | 59.4% |
| Tyranitar | 40.5% | 12.5% | 60.5% |
| Rillaboom | 39.6% | 11.6% | 58.8% |

Most used moves: Metagross:Psychic Fangs (953), Garchomp:Dragon Claw (800), Basculegion:Last Respects (727), Metagross:Protect (722), Basculegion:Protect (705), Basculegion:Aqua Jet (705), Volcarona:Tailwind (625), Garchomp:Stomping Tantrum (602), Volcarona:Heat Wave (600), Volcarona:Struggle Bug (567), Metagross:Stomping Tantrum (565), Metagross:Bullet Punch (528), Basculegion:Wave Crash (524), Volcarona:Rage Powder (456)

Hardest opponents:

- 20.0%: Sneasler @ Electric Seed, Rillaboom @ Miracle Seed, Kingambit @ Life Orb, Incineroar @ Sitrus Berry, Basculegion @ Spell Tag, Charizard @ Charizardite Y
- 20.0%: Garchomp @ Garchompite, Sneasler @ Focus Sash, Froslass @ Froslassite, Kingambit @ Life Orb, Rillaboom @ Miracle Seed, Basculegion @ Spell Tag
- 20.0%: Incineroar @ Sitrus Berry, Garchomp @ Soft Sand, Floette-Eternal @ Floettite, Sylveon @ Fairy Feather, Basculegion @ Focus Sash, Farigiraf @ Colbur Berry
- 20.0%: Garchomp @ Soft Sand, Incineroar @ Passho Berry, Scovillain @ Scovillainite, Basculegion @ Colbur Berry, Farigiraf @ Sitrus Berry, Sneasler @ Focus Sash
- 30.0%: Rillaboom @ Miracle Seed, Basculegion @ Choice Scarf, Sneasler @ Grassy Seed, Incineroar @ Chople Berry, Salamence @ Salamencite, Raichu @ Raichunite Y
- 30.0%: Volcarona @ Grassy Seed, Rillaboom @ Sitrus Berry, Garchomp @ Garchompite Z, Sneasler @ White Herb, Basculegion @ Life Orb, Farigiraf @ Focus Sash

Errors: [{"err":18,"ex":"Can't pass: Your Sylveon must make a move (or switch) :: move 1 2, pass"},{"err":34,"ex":"Can't pass: Your Sylveon must make a move (or switch) :: move 2 2, pass"},{"err":37,"ex":"Can't pass: Your Sylveon must make a move (or switch) :: pass, move 3 2"},{"err":27,"ex":"Can't pass: Your Sylveon must make a move (or switch) :: pass, move 1","crash":1,"ce":"Error: Choices are done immediately after a request\n    at Battle.makeRequest (vendor/pokemon-showdown/dist/sim/battle.js:1173:13)\n    at Battle.endTurn (vendor/pokemon-showdown/dist/sim/battle."},{"err":24,"ex":"Can't pass: Your Sylveon must make a move (or switch) :: move 3 1, pass"},{"err":54,"ex":"Can't pass: Your Hydreigon must make a move (or switch) :: pass, move 4 1"},{"err":31,"ex":"Can't pass: Your Sylveon must make a move (or switch) :: pass, switch 4"},{"err":19,"ex":"Can't pass: Your Sylveon must make a move (or switch) :: pass, move 1 2"},{"err":18,"ex":"Can't pass: Your Hydreigon must make a move (or switch) :: move 2 2, pass"},{"err":14,"ex":"Can't pass: Your Sylveon must make a move (or switch) :: pass, move 2"},{"err":14,"ex":"Can't pass: Your Sylveon must make a move (or switch) :: pass, move 4"}]
