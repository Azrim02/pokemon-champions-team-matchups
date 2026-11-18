# Mega Metagross — Hydreigon / Talonflame Triangles

**Format:** Pokémon Champions · Doubles · Reg M-C (9 Sep – 2 Dec 2026) · Lv 50
**Built:** 1 Oct 2026 · **HTML version:** `regmc-hydreigon-talonflame-sheet.html`
**Data pulled:** 1 Oct 2026 — Pikalytics `gen9championsvgc2026regmc` (ladder)
**Basis:** type matchups, stat math, and a verification pass on 1 Oct 2026 (learnsets, abilities, item prices, damage rolls). Rolls marked † are carried over from `metagross-grassy-armor-tail-team.md`, where the attacker's set and the target are unchanged. All other rolls come from the verification pass and use the Gen 9 formula over 16 rolls against **assumed** target spreads, because Pikalytics doesn't publish Champions spreads.
**Relation to older sheets:** keeps Metagross, Sneasler and Rillaboom from `metagross-grassy-armor-tail-team.md`; drops Farigiraf, Incineroar and Whimsicott for Hydreigon, Talonflame and Rotom-Wash.

---

## The idea

**Three overlapping type triangles. Every member sits in at least one, and the two Pokémon that appear in two of them — Metagross and Talonflame — are the joints.**

| Triangle | Members | Kind |
|---|---|---|
| **A. Steel / Dragon / Fire** | Metagross · Hydreigon · Talonflame | Defensive — the original core |
| **B. Fire / Water / Grass** | Talonflame · Rotom-Wash · Rillaboom | Defensive and offensive |
| **C. Psychic / Fighting / Dark** | Metagross · Sneasler · Hydreigon | Defensive and offensive |

The result: **no attacking type is super-effective on more than two members, and every type that hits anyone super-effectively is resisted by at least one teammate.** Two types have only one resist: **Dragon** (Metagross) and **Ghost** (Hydreigon). (Full table under *Weakness check*.)

---

## The type triangles

### A. Steel / Dragon / Fire — Metagross · Hydreigon · Talonflame

Not a cycle on the type chart, but a complete defensive one: each member covers the next one's weaknesses, in both directions.

```
                    METAGROSS  (Steel/Psychic)
                   ↗                         ↘
   resists Hydreigon's                 Talonflame resists Fire,
   Fairy (4×), Dragon                  is immune to Ground —
   and Ice                             two of Metagross's four
                 ↗                             ↘
      HYDREIGON  ←───────────────────────  TALONFLAME
     (Dark/Dragon)  Hydreigon resists       (Fire/Flying)
                    Water and Electric —
                    two of Talonflame's three
```

| Weak member | Weak to | Covered by |
|---|---|---|
| Hydreigon | **Fairy 4×**, Dragon, Ice | **Metagross** resists all three · Talonflame also resists Fairy |
| Hydreigon | **Fighting**, **Bug** | **Talonflame** ½× / ¼× — Metagross takes both neutrally, which is why Talonflame was picked |
| Metagross | Fire, Ground, Ghost, Dark | **Hydreigon** resists Fire, Ghost, Dark and is immune to Ground (Levitate) · **Talonflame** resists Fire, immune to Ground |
| Talonflame | Water, Electric | **Hydreigon** resists both |
| Talonflame | **Rock 4×** | **Metagross** resists |

**This is why the original Metagross + Hydreigon pair felt right:** Hydreigon absorbs all four of Metagross's weaknesses. Going the other way, two holes were left: Fighting and Bug (Metagross is neutral to Bug, because its Psychic half cancels Steel's resist). Talonflame closes both.

### B. Fire / Water / Grass — Talonflame · Rotom-Wash · Rillaboom

The classic starter triangle. Each member resists the type that hits the one before it.

```
                    TALONFLAME  (Fire/Flying)
                   ↗                        ↘
   takes Grass at ¼×,                   Water hits Talonflame —
   covering Rotom-Wash's                Rillaboom resists it
   only weakness                        (and Electric)
                 ↗                              ↘
      ROTOM-WASH  ←─────────────────────  RILLABOOM
   (Electric/Water)  Fire hits Rillaboom —  (Grass)
                     Rotom-Wash resists it
```

| Weak member | Weak to | Covered by |
|---|---|---|
| Rotom-Wash | **Grass** (its only weakness) | **Talonflame** ¼× · also Metagross, Hydreigon, Rillaboom, Sneasler |
| Rillaboom | **Fire** | **Rotom-Wash** ½× · also Hydreigon, Talonflame |
| Talonflame | **Water** | **Rillaboom** ½× · also Rotom-Wash, Hydreigon |
| Talonflame | Electric | Rillaboom, Hydreigon — **not** Rotom-Wash, which takes Electric at 1× (Water weak × Electric resist) |
| Rillaboom | Flying, Ice | Rotom-Wash resists both · Metagross resists both |

**Offensively it runs the same way:** Talonflame's Flare Blitz beats Grass (opposing Rillaboom, Whimsicott), Rotom-Wash's Hydro Pump beats Fire (Incineroar, Volcarona — and Charizard outside of sun), Rillaboom's Grassy Glide beats Water (Basculegion, Milotic). Grassy Glide is only neutral on Pelipper; Rotom-Wash's Thunderbolt is 4× on it.

### C. Psychic / Fighting / Dark — Metagross · Sneasler · Hydreigon

A true type-chart cycle: **Psychic beats Fighting, Fighting beats Dark, Dark beats Psychic.**

```
                    METAGROSS  (Psychic)
                   ↗                    ↘
   Metagross takes Psychic at ¼×,     Psychic Fangs hits
   Hydreigon is immune — Sneasler's   Fighting-types (opposing
   4× weakness is double-covered      Sneasler 4×)
                 ↗                           ↘
      HYDREIGON  ←───────────────────  SNEASLER
       (Dark)     Close Combat hits     (Fighting/Poison)
                  Dark-types; Sneasler
                  resists Dark for Metagross
```

| Weak member | Weak to | Covered by |
|---|---|---|
| Sneasler | **Psychic 4×** | **Hydreigon 0×** · **Metagross ¼×** |
| Hydreigon | **Fighting** | **Sneasler ½×** |
| Metagross | **Dark** | **Hydreigon ½×** · **Sneasler ½×** |

| Attacker | Hits | M-C targets |
|---|---|---|
| Metagross — Psychic Fangs | **Fighting** | Sneasler 4× (423–505% †) |
| Sneasler — Close Combat | **Dark** | Kingambit **4×**, Tyranitar **4×**, Incineroar 2× |
| Hydreigon — Dark Pulse | **Psychic** | Indeedee-F, Farigiraf, opposing Mega Metagross |

### How the triangles link

- **Ground:** Metagross and Sneasler are weak; **Hydreigon, Talonflame and Rotom-Wash are all immune** and Rillaboom resists. Grassy Terrain halves Earthquake on top.
- **Rock:** Talonflame is 4×; **Metagross and Sneasler resist** — the two Ground-weak members. Talonflame covers their Ground, they cover its Rock.
- **Fairy:** Hydreigon is 4×; Metagross and Talonflame resist (Sneasler is neutral). Iron Head is 2× on Sylveon and Whimsicott; Dire Claw is 2× on Sylveon and 4× on Whimsicott.

---

## Format rules that shape this build

- **No EVs — Stat Points.** 66 per Pokémon, cap 32 per stat. Lv 50: **HP = base + 75 + SP**; every other stat = `(base + 20 + SP) × nature`, floored. Spreads are **HP / Atk / Def / SpA / SpD / Spe**.
- **Item Clause**, **Species Clause**, **one Mega Evolution per battle**. Mega Metagross is the stone — Talonflame, Hydreigon and the rest run as base forms.
- **Open Team List** — build for bring-4.
- **No Terastallization in M-C.**
- **Not in Champions:** Assault Vest, Choice Band, Choice Specs, Covert Cloak, Safety Goggles, Clear Amulet, Loaded Dice, Power Herb.
- **Grassy Terrain only touches grounded Pokémon.** Hydreigon and Rotom-Wash (Levitate) and Talonflame (Flying) get no heal and no Grass boost — the terrain works for Metagross, Rillaboom and Sneasler only.

---

## The team

### 1. Metagross @ Metagrossite
**Ability:** Clear Body → **Tough Claws** · **Nature:** Adamant
**SP:** 2 / 32 / 0 / 0 / 0 / 32 → **157 HP · 216 Atk · 170 Def · 130 SpD · 162 Spe**
**Moves:** Psychic Fangs · Iron Head · Ice Punch · Protect

Unchanged from the grassy sheet.

- **Psychic Fangs** — 4× on Sneasler (#2, 31.8%). Psychic corner of triangle C.
- **Iron Head** — 2× on Sylveon and Whimsicott, the Fairies that threaten Hydreigon 4×.
- **Ice Punch** — 4× on Mega Salamence (123–147% †) and base Garchomp.
- **Every move is contact.** Never click into **Volcarona** — Flame Body burns, Iron Head is ½×, and Heat Wave is 2× back.

### 2. Hydreigon @ Life Orb
**Ability:** Levitate · **Nature:** Modest
**SP:** 2 / 0 / 0 / 32 / 0 / 32 → **169 HP · 110 Def · 194 SpA · 110 SpD · 150 Spe** (→ **300** under Tailwind)
**Moves:** Dark Pulse · Draco Meteor · Earth Power · Protect

The Dark and Dragon corner of two triangles. On the M-C ladder, 22.7% of Hydreigon teams also run Metagross.

- **Absorbs all four of Metagross's weaknesses:** resists Fire, Ghost, Dark; Levitate blanks Ground.
- **Dark Pulse** — 2× on Indeedee-F, Farigiraf, Basculegion, Gholdengo and opposing Mega Metagross. **Immune to Psychic**, so it's the safe partner into Indeedee.
- **Draco Meteor** — 2× on Mega Salamence (**195–231%, OHKO**) and Garchomp (either Mega). Only 1× on Archaludon (Steel/Dragon). Under Tailwind, 300 Speed outruns **Mega Garchomp Z at 223**.
- **Dark Pulse into Indeedee-F** — 103–123% into 0 SpD (OHKO), 75–90% into Sassy max SpD.
- **Earth Power** — the Fire answer you asked for: 2× on Incineroar, **Kingambit, Gholdengo, Archaludon, Tyranitar** and **4× on Arcanine-Hisui**. Ignore it into anything Flying. **Into a bulky Kingambit (32 HP) it's 78–92% — not a KO**; into 0 HP it KOs on 10/16 rolls.

> **Swaps:** **Flamethrower** over Earth Power is 4× on Mega Golisopod (Bug/Steel) and 2× on Kingambit/Gholdengo, at the cost of the Fire-type coverage. **Timid** (165 Spe) outspeeds Adamant Garchomp (154) and mirror Metagross (162) without Tailwind, for −17 SpA. **Don't bother with Roseli Berry:** Life Orb Pixilate Sylveon's spread Hyper Voice does 225–268%, and still 112–134% through Roseli. The answer to Sylveon is keeping Hydreigon in the back.

### 3. Talonflame @ Focus Sash
**Ability:** **Gale Wings** · **Nature:** Jolly
**SP:** 2 / 32 / 0 / 0 / 0 / 32 → **155 HP · 133 Atk · 91 Def · 89 SpD · 195 Spe**
**Moves:** Tailwind · Brave Bird · Flare Blitz · Taunt

The speed control and the joint between triangles A and B.

- **Gale Wings gives Flying moves +1 priority at full HP** — that's **Tailwind and Brave Bird**. It's Talonflame's Hidden Ability. Tailwind moves before everything **except Fake Out (+3)**: a Fake Out flinch still stops it, and Covert Cloak isn't in Champions. Focus Sash doesn't guarantee Tailwind; it guarantees surviving the hit.
- **Resists Fighting (½×) and Bug (¼×)** for Hydreigon, and **Fire (½×) and Ground (0×)** for Metagross.
- **Fire-types cannot be burned**, so Brave Bird into Volcarona (2×) is free of Flame Body. **110–131% at +0 (OHKO), but only 75–89% after its Grassy Seed's +1 Def** — and 51.9% of Volcarona carry the Seed. Our own Rillaboom's terrain is what triggers it.
- **Flare Blitz** — 4× on Mega Golisopod (Bug/Steel), 2× on Rillaboom, Whimsicott, Kingambit, Gholdengo.
- **Taunt** — the team's only Trick Room answer. At 195 Speed it moves before Indeedee-F and Farigiraf, and Trick Room itself is −7 priority. Taunt isn't priority, so Psychic Terrain and Armor Tail don't block it — **but Indeedee-F's Follow Me redirects it.**
- **Gale Wings switches off after any damage**, including Brave Bird and Flare Blitz recoil. Tailwind first, attack later.
- **Jolly 195 outspeeds the whole 189 tier** (Sneasler, Mega Salamence) without priority.

> **Swaps:** **Protect** over Taunt if you're not seeing Trick Room — Rock Slide is the matchup that kills it. **Charti Berry does not save it from Mega Tyranitar:** spread Rock Slide does 212–250% bare and roughly 106–125% through Charti.
> **Priority is blocked** by Psychic Terrain (into grounded targets) and Armor Tail / Queenly Majesty. **Tailwind targets your own side, so it still works under all three.**

### 4. Rotom-Wash @ Leftovers
**Ability:** Levitate · **Nature:** Modest
**SP:** 32 / 0 / 2 / 32 / 0 / 0 → **157 HP · 129 Def · 172 SpA · 127 SpD · 106 Spe**
**Moves:** Hydro Pump · Thunderbolt · Will-O-Wisp · Protect

The Fire counter and Talonflame's bodyguard. **Its only weakness is Grass.**

- **Resists Fire, Water, Ice, Steel (¼) and Flying; immune to Ground.** It switches into Fire aimed at Metagross and Water aimed at Talonflame. **Electric is only neutral on it** — Rillaboom and Hydreigon are the Electric resists.
- **Hydro Pump** — 2× on Incineroar, Charizard, Volcarona, Tyranitar; 4× on Arcanine-Hisui. Only 1× on Garchomp (Dragon/Ground). **Into Incineroar: 96–114% vs 0 SpD (KOs 12/16), 68–81% vs Careful max SpD.** Halved in Mega Charizard Y's sun (48–57%).
- **Thunderbolt** — 4× on Pelipper (**232–275%**), 2× on Basculegion, Talonflame, Charizard. Only 1× on Mega Salamence (Dragon/Flying).
- **Will-O-Wisp** — replaces the Intimidate this team doesn't have. Halves Kingambit, Sneasler, Garchomp and Mega Golisopod. **Fails on Incineroar** (Fire-types can't be burned).

> **Swap:** **Volt Switch** over Protect for a slow pivot that brings Talonflame back in at full HP for a second Gale Wings Tailwind.

### 5. Rillaboom @ Miracle Seed
**Ability:** **Grassy Surge** · **Nature:** Adamant
**SP:** 32 / 32 / 0 / 0 / 2 / 0 → **207 HP · 194 Atk · 110 Def · 92 SpD · 105 Spe**
**Moves:** Fake Out · Grassy Glide · High Horsepower · U-turn

Revised 9 Nov 2026: **High Horsepower over Wood Hammer**. Life Orb moved to Hydreigon, so it holds Miracle Seed (now boosting Grassy Glide only — Sitrus Berry is the alternative).

- **Resists Water and Electric** — Talonflame's two non-Rock weaknesses.
- **Grassy Terrain halves Earthquake** for Metagross and Sneasler, the only two Ground-weak members.
- **Fake Out** — the team's only Fake Out since Sneasler dropped it for Rock Slide.
- **Grassy Glide** — priority 2× on Basculegion, Milotic, Tyranitar. Only 1× on Pelipper (Water/Flying) and Arcanine-Hisui (Fire/Rock).
- **High Horsepower** — 2× on **Incineroar** (its worst matchup: Flare Blitz does 88–104% to it), Kingambit, Gholdengo, Archaludon, Tyranitar, opposing Metagross and Sneasler; **4× on Arcanine-Hisui**. Single-target, and Grassy Terrain doesn't halve it (only Earthquake, Bulldoze, Magnitude). No damage rolls run yet. **Cost:** Wood Hammer was the strongest Grass hit — Grassy Glide does far less into bulky Water/Ground types. Pikalytics: 13.8% of ladder Rillaboom run it, Wood Hammer 36.3%.
- **U-turn** re-deploys Talonflame at full HP for a second Gale Wings Tailwind.
- **Grass-types ignore Rage Powder**, so Volcarona can't redirect it — but Grass is ¼× on Volcarona, so this mostly means Fake Out lands where you want.

### 6. Sneasler @ Grassy Seed
**Ability:** **Unburden** · **Nature:** Jolly
**SP:** 2 / 32 / 0 / 0 / 0 / 32 → **157 HP · 182 Atk · 189 Spe** (→ **378** on Unburden)
**Moves:** Close Combat · Dire Claw · Rock Slide · Protect

Revised 9 Nov 2026: **Protect over Throat Chop**, **Rock Slide over Fake Out** (Rillaboom keeps the team's Fake Out). The Fighting corner of triangle C.

- **Close Combat** — 4× on Kingambit (170–203% †), 4× on Tyranitar, 2× on Incineroar (111–132% †).
- **Grassy Seed in Grassy Terrain** — +1 Def and an instant Unburden: 378 Speed on turn one.
- **Dire Claw** — 2× on Sylveon and **4× on Whimsicott**, the Hydreigon-killers.
- **Rock Slide** — spread, 30% flinch per target, and Sneasler usually moves first so the flinch is live. **4× on Volcarona, Charizard and opposing Talonflame**; 2× on Mega Salamence and Pelipper. Hits opponents only, so our Talonflame is safe. Non-STAB and spread-reduced: chip and flinches outside the 4× targets, 90% accuracy. No damage rolls run yet.
- **Protect** — scouts Fake Out and focus fire on a frail attacker. Throat Chop's targets (Gholdengo, Farigiraf) are already Hydreigon's: Dark Pulse 2× on both, Earth Power 2× on Gholdengo.
- Pikalytics M-C moves: Close Combat 51.9% · Dire Claw 36.7% · Protect 23.6% · Fake Out 22.8% · Rock Slide 11.4%.
- **4× weak to Psychic.** Bench it into Indeedee-F's Psychic Terrain — Expanding Force wrecks it and the Seed never triggers.

---

## Items (Item Clause check)

| Pokémon | Item | Why |
|---|---|---|
| Metagross | **Metagrossite** | The one Mega. |
| Hydreigon | **Life Orb** | 58.6% of ladder Hydreigon; no Choice Specs in Champions. |
| Talonflame | **Focus Sash** | Survives the turn-1 hit. Gale Wings shares the full-HP condition, so chip breaks both. |
| Rotom-Wash | **Leftovers** | Long-game pivot; the terrain doesn't heal it. |
| Rillaboom | **Miracle Seed** | Life Orb is taken; Grass boost on terrain-boosted Glide. |
| Sneasler | **Grassy Seed** | Turn-one Unburden. |

All six distinct, all confirmed on Serebii's Champions item list. **VP:** Metagrossite 2,000 · Life Orb 1,000 · Miracle Seed 700 · Grassy Seed 700 · Focus Sash and Leftovers free — **4,400 total.**

---

## Weakness check

| Attacking type | Super-effective on | Resisted / immune |
|---|---|---|
| Fire | Metagross, Rillaboom | Hydreigon, Talonflame, Rotom-W |
| Water | Talonflame | Hydreigon, Rotom-W, Rillaboom |
| Electric | Talonflame | Hydreigon, Rillaboom — Rotom-W is neutral |
| Grass | Rotom-W | Metagross, Hydreigon, Talonflame (¼), Rillaboom, Sneasler |
| Ground | Metagross, Sneasler | **Hydreigon, Talonflame, Rotom-W (0×)** · Rillaboom · terrain halves EQ |
| Rock | **Talonflame (4×)** | Metagross, Sneasler |
| Fighting | Hydreigon | Talonflame, Sneasler |
| Fairy | **Hydreigon (4×)** | Metagross, Talonflame |
| Ice | Hydreigon, Rillaboom | Metagross, Rotom-W |
| Bug | Hydreigon, Rillaboom | Talonflame (¼), Sneasler (¼) — Metagross is neutral |
| Dragon | Hydreigon | Metagross |
| Psychic | **Sneasler (4×)** | Metagross (¼), Hydreigon (0×) |
| Dark | Metagross | Hydreigon, Sneasler |
| Ghost | Metagross | Hydreigon |
| Flying | Rillaboom, Sneasler | Metagross, Rotom-W |
| Poison | Rillaboom | Metagross (0×), Sneasler |
| Steel | — | Metagross, Talonflame, Rotom-W (¼) |
| Normal | — | Metagross |

---

## Speed tiers (Lv 50)

| Pokémon | Speed | Under Tailwind |
|---|---|---|
| **Sneasler, ours (Unburden)** | **378** | — |
| Mega Garchomp Z (Jolly) | 223 | |
| **Talonflame, ours (Jolly)** | **195** + Gale Wings priority | 390 |
| Mega Salamence / Sneasler (Jolly) | 189 | |
| Garchomp (Jolly) | 169 | |
| **Mega Metagross, ours** | **162** | **324** |
| Rillaboom (Jolly) | 150 | |
| **Hydreigon, ours (Modest)** | **150** | **300** |
| Gholdengo (Timid) | 149 | |
| **Rotom-Wash, ours** | **106** | **212** |
| **Rillaboom, ours (Adamant)** | **105** | **210** |
| Incineroar / Farigiraf | 80 | |

**Tailwind puts everything except Rotom-Wash and Rillaboom above Mega Garchomp Z.** Rillaboom doesn't need Speed — Glide and Fake Out are priority.

---

## Threat sheet

Usage from the M-C ladder, 1 Oct 2026. Percentages are from the verification pass, against assumed spreads.

| Threat | Usage | Primary answer | Backup |
|---|---|---|---|
| **Rillaboom** | 35.2% | Talonflame Brave Bird / Flare Blitz 2× | Metagross walls it; keep Rotom-W out of Grassy Glide |
| **Sneasler** | 31.8% | Metagross Psychic Fangs 4× · their Dire Claw is 0× on Metagross | Talonflame priority Brave Bird 2× |
| **Incineroar** | 25.1% | Sneasler CC 2× · Rotom-W Hydro Pump 2× | Hydreigon Earth Power 2×, Rillaboom High Horsepower 2×; Will-O fails on it |
| **Mega Golisopod** | 20.8% | **Talonflame Flare Blitz 4×** | Rotom-W Will-O-Wisp; Hydreigon Flamethrower if swapped in |
| **Mega Salamence** | 20.8% | Metagross Ice Punch 4× | Hydreigon Draco Meteor 195–231% (OHKO) |
| **Indeedee-F** | 20.3% | Hydreigon Dark Pulse 103–123% (immune to Psychic) | Talonflame Taunt on Trick Room — Follow Me can redirect it |
| **Kingambit** | 20.1% | Sneasler CC 4× | Talonflame Flare Blitz 2×, Hydreigon Earth Power 2× (78–92% into bulky), Will-O |
| **Farigiraf** | 19.7% | Hydreigon Dark Pulse 2× | Armor Tail blocks your Fake Out / Glide / priority Brave Bird — **Tailwind still works** |
| **Basculegion** | 18.5% | Rotom-W Thunderbolt 2×, Rillaboom Glide 2× | Hydreigon resists Last Respects (Ghost) |
| **Garchomp** (either Mega) | 16.8% | Tailwind → Hydreigon Draco 2× | Metagross Ice Punch; three members Ground-immune |
| **Charizard** | 15.8% | **Rotom-W Thunderbolt 2×** — 96% are Mega Y, whose sun halves Hydro Pump | Sneasler Rock Slide 4× (not halved by sun); Talonflame and Hydreigon resist Fire |
| **Gholdengo** | 15.1% | Hydreigon Dark Pulse **and** Earth Power 2× | Talonflame Flare Blitz 2× |
| **Archaludon** | 15.0% | Hydreigon Earth Power 2×, Sneasler CC 2× | Rillaboom / Hydreigon resist Electro Shot for Talonflame |
| **Pelipper** | 12.1% | Rotom-W Thunderbolt 4× (232–275%) | — |
| **Sylveon / Whimsicott** | 9.6% / 11.4% | Metagross Iron Head 2× | Sneasler Dire Claw 2× / 4×; keep Hydreigon off the field vs Hyper Voice |
| **Tyranitar** (85% Mega) | 8.5% | Sneasler CC 4× | Rotom-W Hydro Pump 2×, Rillaboom High Horsepower 2×; **Protect Talonflame on Rock Slide turns** |
| **Volcarona** | 6% | **Talonflame Brave Bird** — 110–131% at +0, 75–89% after its Grassy Seed; burn-immune | Sneasler Rock Slide 4× · Rotom-W Hydro Pump 2×; never contact it with Metagross |

---

## Leads and bring-4

**Default lead: Talonflame + Metagross.** Priority Tailwind turn 1 off Sash, Metagross attacks into it at 324.

| Opponent shows | Bring | Lead |
|---|---|---|
| Standard (Rillaboom / Sneasler / Salamence) | Talonflame · Metagross · Hydreigon · Sneasler | Talonflame + Metagross |
| Kingambit / Incineroar / Tyranitar heavy | Rillaboom · Sneasler · Metagross · Rotom-W | Rillaboom + Sneasler — Fake Out into Close Combat |
| **Fire / Sun / Volcarona** | Rotom-W · Talonflame · Hydreigon · Sneasler | Rotom-W + Talonflame; Metagross stays home |
| Rain (Pelipper / Basculegion / Archaludon) | Rotom-W · Rillaboom · Hydreigon · Metagross | Rotom-W + Rillaboom; **bench Talonflame** |
| Garchomp (either Mega) | Talonflame · Hydreigon · Metagross · Rotom-W | Talonflame + Hydreigon — Tailwind, then Draco |
| **Indeedee-F / Trick Room** | Talonflame · Hydreigon · Metagross · Rotom-W | Talonflame + Hydreigon — Taunt the setter, Dark Pulse Indeedee; **bench Sneasler** |
| Fairy-heavy (Sylveon / Whimsicott) | Metagross · Sneasler · Talonflame · Rotom-W | Metagross + Sneasler; **bench Hydreigon** |

**Under Psychic Terrain** (Indeedee-F): Fake Out, Grassy Glide and Gale Wings Brave Bird into grounded targets all fail, Grassy Terrain is overwritten, and Sneasler's Seed is dead. Tailwind still goes up. Bring Rillaboom in later to take the terrain back.

---

## Known costs, stated plainly

- **No Intimidate.** Every physical threat — Kingambit, Sneasler, Garchomp, Golisopod — hits at full power. Will-O-Wisp is the substitute and costs a turn. (Side effect: Kingambit's Defiant never triggers.)
- **Rock Slide is the scariest spread move.** Talonflame is 4×. 85% of Tyranitar are **Mega** Tyranitar, and 48.4% of Tyranitar sets run Rock Slide: spread Rock Slide does 212–250% to Talonflame, and Charti Berry doesn't save it. Sash buys one hit, but Sand Stream chip breaks Sash and Gale Wings after turn 1.
- **Hydreigon is 4× to Fairy.** Life Orb Sylveon's spread Hyper Voice does 225–268%, and 112–134% even through Roseli Berry. Keep Hydreigon in the back against Sylveon.
- **Trick Room has one answer: Talonflame's Taunt**, and Follow Me can redirect it. If Talonflame is down, you play out the five turns.
- **Fake Out beats Gale Wings.** Fake Out is +3 and Tailwind is +1, so a flinch stops Tailwind. Rillaboom, Sneasler and Incineroar all carry Fake Out.
- **Only half the team is grounded**, so Grassy Terrain heals and boosts three Pokémon, not six. The terrain is here for Sneasler's Seed and the Earthquake halving.
- **Gale Wings is fragile.** Any chip — Fake Out, sand, recoil from its own Brave Bird — turns priority off for the rest of the game unless it's pivoted out and healed.

---

## Verification pass (1 Oct 2026)

**Confirmed**
- **Learnsets.** Taunt and Protect on Talonflame, Will-O-Wisp and Volt Switch on Rotom-Wash, and Flamethrower and Earth Power on Hydreigon are all learnable ([Serebii Champions dex](https://www.serebii.net/pokedex-champions/talonflame/)).
- **Gale Wings** is Talonflame's Hidden Ability: +1 priority to Flying moves at full HP ([Game8](https://game8.co/games/Pokemon-Champions/archives/593567)).
- **Charizard is 96.1% Mega Y** and 3.6% Mega X. Expect Drought sun: it halves Hydro Pump, and Charizard keeps its Electric weakness.
- **All six stat lines and the speed tiers** check out against base stats and the formula.
- **Item prices** come from Serebii (see Items).

**Corrected in this pass:** Metagross is neutral to Bug, Sneasler is neutral to Fairy, and Rotom-Wash is neutral to Electric. Draco Meteor is only 1× on Archaludon, and Hydro Pump only 1× on Garchomp. Thunderbolt is only 1× on Mega Salamence, and Grassy Glide only 1× on Arcanine-Hisui and Pelipper. Dire Claw is 4× on Whimsicott, and Close Combat is 1× on Farigiraf. Focus Sash doesn't guarantee Tailwind, and Fake Out still beats it. Neither Charti Berry nor Roseli Berry fixes its matchup.

**Still open**
- **VP cost of changing an ability.** The sources disagree: Game8 says 0 for a regular ability and 500 for a Hidden Ability, [Serebii](https://www.serebii.net/pokemonchampions/training.shtml) says a flat 400, and champdex says a flat 500. Gale Wings most likely costs 500. A Training Ticket makes any change free.
- **Mega Garchomp Z's 223 Speed** hasn't been checked.
- **Target spreads in the damage numbers are assumptions.** Cross-check the close rolls (Earth Power on Kingambit, Brave Bird on +1 Volcarona, Hydro Pump on Incineroar) with the [op.gg calculator](https://op.gg/pokemon-champions/calculator).

---

## Sources

- [Pikalytics — Reg M-C ladder](https://www.pikalytics.com/pokedex/gen9championsvgc2026regmc) · [Hydreigon](https://www.pikalytics.com/pokedex/gen9championsvgc2026regmc/Hydreigon) · [Metagross](https://www.pikalytics.com/pokedex/gen9championsvgc2026regmc/Metagross) · [Talonflame](https://www.pikalytics.com/pokedex/gen9championsvgc2026regmc/Talonflame) · [Rotom-Wash](https://www.pikalytics.com/pokedex/gen9championsvgc2026regmc/Rotom-Wash) · [Volcarona](https://www.pikalytics.com/pokedex/gen9championsvgc2026regmc/Volcarona) · [Tyranitar](https://www.pikalytics.com/pokedex/gen9championsvgc2026regmc/Tyranitar)
- [Serebii — Talonflame (Champions)](https://www.serebii.net/pokedex-champions/talonflame/) · [Serebii — Champions items](https://www.serebii.net/pokemonchampions/items.shtml)
- [Victory Road — Regulations](https://victoryroad.pro/champions-regulations/) · [Pokémon Zone — Flying types](https://www.pokemon-zone.com/champions/types/flying/)
- Format rules and † rolls: `metagross-grassy-armor-tail-team.md`

> *Pikalytics' ability column is unreliable for Champions (it lists Talonflame as Trace/Hospitality). Abilities here come from Serebii and the Talonflame tournament page (Gale Wings 98.6%).*
