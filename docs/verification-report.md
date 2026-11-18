# Verification report: Regulation M-C dataset, pipeline and matchup modules

## 1. Summary

| | |
| --- | --- |
| Date | 2026-11-19 (run started 2026-11-18 23:49 +08:00) |
| Repo commit | `2027048cad5e7fca1936fc59a322515d0fd7fb82` (see note) |
| Pinned Showdown commit | `5b88c476113d51a939bddbcd00b5cd182a5d8058` (GitHub: 2026-11-18T14:04:21Z, "Remove Mega Evolution Battle (#12474)") |
| `vendor/.pinned-commit` | matches `SHOWDOWN.commit` (`pipeline/config.js:13`) |
| `npm test` | **82 pass, 0 fail, 0 skipped** (Showdown integration tests ran) |
| **Confirmed** | **62** |
| **Wrong** | **8** |
| **Disputed** | **7** |
| **Unverifiable** | **6** |

**Note on the commit.** When the run started, HEAD was `d664861` and `src/` plus the new tests were uncommitted. At
23:50:44 the user committed them as `2027048`. At about 23:53 the user also changed `package.json` and
`package-lock.json` (adding react, vite and typescript), `.gitignore`, `vite.config.ts`, `web/` and
`docs/metagross-hydreigon-talonflame-team.md`. None of these changes were made by this audit. The `src/` and
`test/` files audited have timestamps before the commit, so they are the committed content. The later web and
dashboard files are out of scope. `data/` was unchanged at the end of the run (`git diff --stat data/` is empty).

### Most severe problems

1. `ABILITY_TYPE_MODIFIERS` is missing **Eelevate**, the Ground immunity of Mega Eelektross (new in Champions), so
   `teamDefense` shows Mega Eelektross as weak (x2) to Ground. This is wrong matchup output.
2. **No descriptions are exported**: `shortDesc` and `desc` are missing from all 166 items, 510 moves and 216 abilities.
   At the pinned commit, Showdown only exposes this text through `Dex.loadTextData()`.
3. The MetaVGC citation is wrong. Its "148 items, 16 Megas, 224 Pokémon" are **Reg M-B** figures, and the M-C URL
   redirects to the index page.
4. The Bulbapedia link is dead: the Draft page is gone and the article is now `Regulation_Set_M-C`. That page also
   **omits Kingambit**.
5. The plan's "validate against Bulbapedia / Pokémon-Zone" step never runs, because `data/reference/` is empty.

The core data holds up well. The 231 species match the **official in-game eligible list** exactly. The 166 items
match Serebii's Champions item list exactly (57 held, 81 Mega Stones, 28 Berries). Base stats, types, Mega
abilities, learnsets, the type chart, the stat formula and 6 hand-computed damage calcs all check out.

---

## 2. Wrong (most severe first)

### W1. Eelevate is missing from `ABILITY_TYPE_MODIFIERS`, so Mega Eelektross shows a Ground weakness (High, changes results)
- **Where:** `src/typeMatrix.js:8-25`. The comment at `src/typeMatrix.js:5-6` says every purely type-based ability is listed.
- **Evidence:**
  - Serebii, Champions "New Abilities" (https://www.serebii.net/pokemonchampions/newabilities.shtml): *"Eelevate: The
    Pokémon floats off the ground, making it immune to Ground-type moves…"*
  - The pinned Showdown text (`Dex.loadTextData().Abilities.eelevate.desc`) begins *"This Pokemon is immune to Ground-type
    attacks…"*.
  - `data/pokemon.json` has `Eelektross-Mega` with `abilities: {0: "Eelevate"}`, and Eelektrossite is legal.
  - Running `teamDefense([Eelektross @ Eelektrossite, Eelektross (Levitate)])` gives a Ground row of `[2, 0]`. The Mega
    is shown as x2 to Ground when it should be immune.
- **Fix:** add `'Eelevate': { Ground: 0 }`, plus a test for Mega Eelektross. See also D7 (Filter / Solid Rock).

### W2. The export has no item, move or ability descriptions (Medium, data gap)
- **Where:** `pipeline/export-dex.js:61-62` (items), `:83` (moves) and `:91` (abilities) write `shortDesc: x.shortDesc || x.desc`
  and `desc`.
- **Evidence:** counts in the committed export:
  `abilities 216, with shortDesc 0, with desc 0; items 166, with shortDesc 0; moves 510, with shortDesc 0`.
  `JSON.stringify` drops `undefined` values, so the fields are silently absent. In the pinned sim,
  `Dex.forFormat(...).abilities.get('levitate').shortDesc` is `undefined`, while `Dex.loadTextData().Abilities.levitate.shortDesc`
  has the text. Champions-specific text (for example Eelevate) is present in `loadTextData()`.
- **Fix:** take descriptions from `Dex.loadTextData()` (with the mod's text overrides) and add a test that fails when
  `shortDesc` is empty.

### W3. MetaVGC is cited for M-C, but its figures are for M-B (Medium, wrong citation and wrong count)
- **Where:** `docs/data-sources-plan.md:48`: "MetaVGC – M-C … Totals: ~224–229 Pokémon, 148 items, 16 Megas".
- **Evidence:**
  - `https://metavgc.com/regulations/regulationm-c` returns 308 and redirects to `https://metavgc.com/regulations`. The
    page text reads *"Regulation Set M-B … Features 224 legal Pokémon, 16 Mega Evolutions, and 148 held items."*
  - The pinned Showdown M-B format (`gen9championsvgc2026regmb`, mod `championsregmb`) has exactly **148** legal items.
    M-C has **166**, which is M-B's 148 plus 18 new items (Absolite Z, Air Balloon, Baxcalibrite, Binding Band,
    Eject Button, Electric Seed, Garchompite Z, Golisopite, Grassy Seed, Leek, Lucarionite Z, Misty Seed, Normal Gem,
    Psychic Seed, Red Card, Rocky Helmet, Salamencite, Terrain Extender). No items were removed.
  - GameWith and Serebii independently list those same 18 (12 held items and 6 Mega Stones).
  - "16 Megas" is also not an M-C figure. M-C has 81 Mega Stones and 82 Mega formes (Bulbapedia lists 81 Mega Evolutions).
- **Fix:** relabel the figures as M-B, or remove them. Record the M-C totals (231 species, 166 items, 81 Mega Stones)
  and their sources.

### W4. The Bulbapedia link is dead, and the page is no longer a draft (Medium, stale source)
- **Where:** `docs/data-sources-plan.md:46`: `https://bulbapedia.bulbagarden.net/wiki/Draft:Regulation_Set_M-C`, "Still a draft page".
- **Evidence:** the MediaWiki API returns `"Draft:Regulation Set M-C" … "missing"`, and following the URL gives 404/403. The live
  article is `https://bulbapedia.bulbagarden.net/wiki/Regulation_Set_M-C`, a full page with an infobox (dates
  2026-09-09 02:00 to 2026-12-02 01:59 UTC) and lists of eligible Pokémon and Megas. That page **omits Kingambit**
  (#0983). Kingambit is on the official in-game list and on Smogon (42.25% usage), so the error is on Bulbapedia's side.
- **Fix:** update the URL and note, and record that Kingambit is missing on Bulbapedia so a future reference diff
  isn't misread.

### W5. pipeline/README says the usage summary is gitignored, but it is committed (Low, doc contradiction)
- **Where:** `pipeline/README.md:99`: "`data/usage/<month>/<format>-<cutoff>{,.raw}.json` (gitignored)".
- **Evidence:** `.gitignore:3` ignores only `data/usage/**/*.raw.json`. `git ls-files data` includes
  `data/usage/2026-10/gen9championsvgc2026regmc-1760.json`. `pipeline/README.md:116` correctly says the summaries are committed.
- **Fix:** write "(raw file gitignored; summary committed)".

### W6. The validation step against external lists never runs (Low to Medium, gap between plan and pipeline)
- **Where:** `docs/data-sources-plan.md:67-68` ("Validate: compare species and item lists against the Bulbapedia / Pokémon-Zone
  M-C lists") and `pipeline/validate.js:2`.
- **Evidence:** `data/reference/` is empty. `npm run data:validate` prints `WARN No reference list at data/reference/regulation-m-c.json;
  skipped comparison against external lists.` The code works (unit-tested), but no external list was ever checked.
- **Fix:** commit `data/reference/regulation-m-c.json` built from the **official** list at
  `https://web-view.app.pokemonchampions.jp/battle/pages/events/rs178713870219xeaaio/en/pokemon.html` (linked from the official
  regulation page), plus Serebii's item list. This audit found the expected differences, which are the formes in D3.

### W7. The plan says to load Showdown from npm, but the code builds from git (Low, outdated doc)
- **Where:** `docs/data-sources-plan.md:27-29`: "Load the mod through the `pokemon-showdown` npm package (or `@pkmn/dex` + `@pkmn/mods`)".
- **Evidence:** `pipeline/setup-showdown.js:2,24-31` fetches and builds from git. The npm registry's latest `pokemon-showdown` is
  `0.11.11`, published 2026-07-28, before M-C started. That supports the comment in setup-showdown.js.
- **Fix:** update the plan to describe the pinned git build.

### W8. Checks and Counters is called "main input" data, but it is almost empty (Low, misleading)
- **Where:** `docs/data-sources-plan.md:36-37` ("Contents: … checks/counters per Pokémon. This is the main input…").
  The same applies to `pipeline/lib/usage.js:44-46`.
- **Evidence:** in `2026-10/gen9championsvgc2026regmc-1760` only **1 of 277** Pokémon (Kingambit, whose entry lists
  Incineroar) has any Checks and Counters entries. In the summary, `checksAndCounters` is empty for 276 of 277.
- **Fix:** document that C&C is sparse at high cutoffs, and don't rely on it in the dashboard (or use cutoff 0/1500).

---

## 3. Disputed

| # | Claim / data | Where | Sources disagree | My view (confidence) |
| --- | --- | --- | --- | --- |
| D1 | Double Shock accuracy 100 | `data/moves.json` (doubleshock) | Serebii "Updated Attacks" gives the Champions accuracy as "--" (S/V 100). Bulbapedia's Double Shock page lists the Champions change as "now a punching move" only, with accuracy 100. Dittobase also gives 100. | Ours (100) is probably right; Serebii's "--" looks like a data-entry slip (medium). Pawmot, new in M-C, uses this move. |
| D2 | Trick Room learners: ours has Mr. Mime and not Wigglytuff | `data/learnsets.json` | Bulbapedia's Trick Room page (Champions table) marks Wigglytuff ✔ and has no Mr. Mime row | Probably ours is right: mainline Showdown data also has no Trick Room for Wigglytuff, and Bulbapedia's table seems to have one row swapped (low-medium). This was the only mismatch in 1,120 learner pairs. |
| D3 | Out-of-battle formes: 269 exported vs **262** on the official list | `data/pokemon.json` | The official in-game list and Bulbapedia show one Vivillon (Fancy pattern, official id `0666-018`), one Polteageist, one Maushold (`0925-001`) and one Sinistcha. Squawkabilly appears twice officially and four times on Bulbapedia. Ours adds Vivillon-Fancy, Vivillon-Pokeball, Polteageist-Antique, Maushold-Four, Sinistcha-Masterpiece and Squawkabilly-Blue/White/Yellow, because Showdown doesn't mark them cosmetic. | The species set is identical: **231 = 231** by dex number. The extra formes have identical stats, and the abilities are right (Squawkabilly White/Yellow have Sheer Force). This doesn't affect calcs, but pokemon counts and "registerable" lists include duplicates. Consider folding them into `cosmeticFormes` (high confidence that this is cosmetic only). |
| D4 | "Bring 6 Pick 4 (doubles)" | `docs/data-sources-plan.md:23-24` | Serebii M-C page: Doubles is a *"Team of 4 to 6 Pokémon … All Pokémon then set to Level 50"*. Victory Road: you *"select four of the six Pokémon"*. Showdown's champions `flatrules` adds `Min Team Size = 6`. | Pick 4 is confirmed. "Bring 6" holds for Showdown and VGC events, but in-game ranked allows 4–6 (medium). |
| D5 | Species Clause is by Pokédex number, so regional formes clash | `src/team.js:132-133` | Victory Road: *"no two Pokémon with the same National Pokédex number"*. A Game8 snippet (seen only in search results) reads "same species other than regional forms". | Ours matches Victory Road and Showdown. Game8's wording is ambiguous and I couldn't read the full page (medium). |
| D6 | Mega count: 82 Mega formes vs Bulbapedia's 81 | `data/meta.json` counts | Bulbapedia lists "Mega Meowstic" once. Showdown splits it into Meowstic-M-Mega and Meowstic-F-Mega (one stone, Meowsticite, maps to both). | Both are right; only the counting differs. Stones: 81 on both sides (high). |
| D7 | Whether Filter / Solid Rock belong in `ABILITY_TYPE_MODIFIERS` | `src/typeMatrix.js:5-25` | These cut super-effective damage to 0.75x, which depends only on type effectiveness. They're legal on Mega Aggron, Mr. Mime (Filter), Camerupt and Rhyperior (Solid Rock). | Arguably type-based, so this is a judgement call. If they're added, apply x0.75 to cells with multiplier >1 (low). |

## 4. Unverifiable

| # | Claim | Where | Why | Notes |
| --- | --- | --- | --- | --- |
| U1 | Pokémon-Zone "Lists the 18 new items (e.g. Absolite Z)" | `docs/data-sources-plan.md:47` | The site returns HTTP 403 to every fetch, and search found nothing | The count of 18 is corroborated by GameWith and Serebii (12 held + 6 stones). |
| U2 | Official eligible **item** list | data/items.json | The official "Eligible Held Items" page (`…/en/item.html`) has an empty grid and no data in its HTML | Items are checked against Serebii, GameWith and Showdown instead. |
| U3 | "Atk … → 200 (matches the in-game stat screen)" | `test/calc.test.js:18` | No in-game screenshot available | The formula matches Bulbapedia's Stat point page: floor((130+32+20)×1.1)=200. |
| U4 | "Older stats store checks as [n, score, sd]" | `pipeline/lib/usage.js:15` | No older chaos file inspected | The current format `{n,p,d}` is confirmed. |
| U5 | PokéAPI has no Champions legality data | `docs/data-sources-plan.md:60` | Not checked | |
| U6 | otterlyclueless "doesn't track which regulation an entry is legal in" | `docs/data-sources-plan.md:57-58` | Repo tree not inspected in depth | The licence, last-commit date and mechanics files are confirmed (see table). |

---

## 5. Confirmed

| # | Claim | Where | Evidence / source |
| --- | --- | --- | --- |
| 1 | Test suite passes | `npm test` | `# tests 82 # pass 82 # fail 0 # skipped 0` |
| 2 | Pinned commit matches the vendor build | `pipeline/config.js:13`, `vendor/pokemon-showdown/.pinned-commit` | both `5b88c47…`; `git rev-parse HEAD` in vendor is the same |
| 3 | Pin date "master @ 2026-11-18" | `pipeline/config.js:13` | GitHub API: committed 2026-11-18T14:04:21Z |
| 4 | Export is deterministic | `pipeline/README.md:118`, `export-dex.js:103` | `npm run data:dex` then `git diff --stat data/` is empty |
| 5 | Validate reports 0 errors | `npm run data:validate` | "358 Pokémon, 166 items, 510 moves, 216 abilities — 0 errors, 1 warnings" |
| 6 | Usage summary reproduces from raw | `data/usage/2026-10/…-1760.json` | re-ran `fetch-usage.js --month 2026-10 --cutoff 1760 --format gen9championsvgc2026regmc`; `cmp` identical |
| 7 | Cached raw equals live Smogon | `…-1760.raw.json` | downloaded the live file; `info` and `data` deep-equal |
| 8 | Formats `gen9championsvgc2026regmc`, `…regmcbo3` with cutoffs 0/1500/1630/1760 | `config.js:27-29`, `docs:34-35` | smogon.com/stats/2026-10/chaos/ index lists all 8 files (the singles `bssregmc` also exists) |
| 9 | M-C dates 2026-09-09 to 2026-12-02 | `config.js:21-22`, docs:4 | Official page: "September 9, 2026, at 02:00 UTC to … December 2, 2026, at 01:59 UTC" (champions-news.pokemon-home.com/en/page/816.html); Bulbapedia, Serebii and Victory Road agree |
| 10 | Item Clause | `team.js:122-134`, docs:23 | Official: "Duplicate held items are not allowed." |
| 11 | Level 50 | docs:23 | Serebii: "All Pokémon then set to Level 50"; Victory Road: auto-leveled to 50 |
| 12 | Species Clause | docs:23, `team.js:133` | Victory Road: no two with the same National Pokédex number |
| 13 | No Mythicals or Restricted Legendaries | docs:23-24, data.test.js:49-51 | None appear on the 231-species official list; Showdown `flatrules` banlist |
| 14 | Stat Point caps 32 per stat and 66 total | `src/data.js:8`, `team.js:113-119` | Bulbapedia Stat point: "limited to a total of 32 stat points per stat, and 66 stat points in total"; otterlyclueless sp-system.md; Showdown team-validator.ts:1316 |
| 15 | Stat formula HP = base+SP+75; others floor((base+SP+20)×nature) | `test/calc.test.js:18`, `speed.test.js:6` | Bulbapedia Stat point formula; `@smogon/calc` `calcStatChampions`. Hand calcs: Garchomp HP 185, Atk 200, Spe 169 Jolly / 154 neutral |
| 16 | Species pool | `data/pokemon.json` | **231 species = official in-game list** (262 entries, `…/rs178713870219xeaaio/en/pokemon.html`), compared by dex number; no differences |
| 17 | Item pool (166) | `data/items.json` | Serebii Champions items: 57 held + 81 Mega Stone + 28 Berries = 166; set difference is 0 both ways (Serebii also lists 34 non-battle tickets) |
| 18 | Count gap 166 vs 148 explained | docs:48 | M-B has 148 (Showdown `championsregmb`); M-C adds 18 and removes 0 (see W3) |
| 19 | 6 new Megas (Absol Z, Salamence, Garchomp Z, Lucario Z, Golisopod, Baxcalibur) | data.test.js:64-70 | Official page; Serebii; Victory Road; Showdown M-B to M-C delta |
| 20 | 12 new held items | — | Serebii "Newly Added Items" and GameWith match the delta exactly |
| 21 | 23 new species / 29 new formes | — | Serebii "Newly Useable Pokémon" and GameWith (29 formes) match the delta exactly |
| 22 | Base stats and types: 45 formes auto-checked plus 13 by hand, 0 differences | `data/pokemon.json` | Bulbapedia `{{Stats}}` (Gen VIII-onward values); includes every M-C Mega Z, Mega Salamence/Golisopod/Baxcalibur/Floette/Chimecho/Raichu X·Y/Dragonite/Venusaur/Charizard X·Y, regional formes (Ninetales-Alola, Raichu-Alola, Slowking-Galar, Typhlosion-Hisui, Paldean Tauros ×3), Aegislash both formes, Basculegion M/F, Indeedee M/F, Palafin/Hero, and staples |
| 23 | Garchomp-Mega-Z is pure Dragon with Levitate, 108/130/85/141/85/151 | `test/calc.test.js:48-60` | Bulbapedia (form3type1=Dragon, abilitym2=Levitate); Serebii Mega abilities |
| 24 | Absol-Mega-Z Dark/Ghost with Sharpness; Lucario-Mega-Z with Aura Guard | `data/pokemon.json` | Bulbapedia stats; Serebii Mega abilities |
| 25 | Abilities of all 40 Champions-new Megas | `data/pokemon.json` | Serebii "Mega Evolution Abilities": 40/40 match; the 42 classic Megas also look right |
| 26 | Every Mega Stone maps to the right Mega | `data/items.json` megaEvolves | 81 stones, 0 bad mappings (requiredItem and battleOnly cross-checked); stone names match Serebii's 81 |
| 27 | Learnsets match Bulbapedia's Champions tables | `data/learnsets.json` | 28 moves, **1,119 of 1,120** learner species agree (one disputed, D2) |
| 28 | "Incineroar can't learn Knock Off" | `team.test.js:83` | Bulbapedia Knock Off, Champions table: `Incineroar … −` |
| 29 | 24 more test-relevant learnset pairs (Garchomp EQ/Dragon Claw/Draco/Earth Power/Flamethrower/Rock Slide/SD, not Knock Off; Incineroar Fake Out/Flare Blitz/Parting Shot/Darkest Lariat; Charizard Heat Wave/Weather Ball/Solar Beam/Ancient Power; Kingambit Kowtow Cleave/Sucker Punch; Sneasler CC/Dire Claw; Whimsicott Tailwind; Rotom Thunderbolt; Rotom-Wash Hydro Pump; Aegislash Shadow Ball; Dragonite Dragon Claw) | tests | Bulbapedia Champions tables (Rotom-Wash from the forme row) |
| 30 | Champions move rebalances | `data/moves.json` | 22 of 23 of Serebii's "Updated Attacks" match on BP, accuracy and effect chance (D1 is the exception); Dragon/Crush/Shadow Claw are slicing; Dragon Cheer is sound; Double Shock is punch |
| 31 | Type chart: 18×18, no Stellar, standard Gen 9 | `data/typechart.json`, data.test.js:87-96 | all 324 cells match a hand-written Gen 9 chart |
| 32 | Stellar dropped because Champions has no Tera | `export-dex.js:94` | Bulbapedia, Pokémon Champions: Tera "will also be supported in the future" (not yet). Revisit if Tera arrives |
| 33 | Damage: Garchomp EQ vs Incineroar, Doubles | calc.test.js | own Gen 9 formula: 16/16 rolls identical (198–237) |
| 34 | Damage: same, Singles | calc.test.js:24-29 | 16/16 identical (268–320); max ratio 237/320 = 0.741, consistent with ×0.75 then rounding |
| 35 | Damage: Dragon Claw vs Incineroar (single target) | — | 16/16 identical (109–129) |
| 36 | Damage: Flare Blitz vs Garchomp under Reflect (Doubles 2732/4096) | calc.test.js:62-66 | 16/16 identical (26–31) |
| 37 | Damage: Mega Charizard Y Heat Wave in Sun, spread, vs Garchomp | — | 16/16 identical (66–78) |
| 38 | Damage: Mega Garchomp Z Draco Meteor vs Garchomp | — | 16/16 identical (270–320) |
| 39 | Doubles spread modifier 0.75 | `src/calc.js:5`, src/README:161 | standard Gen 9 3072/4096; Champions sources (Pokesynergy, Champions Companion wiki) say 0.75×, and none disagree |
| 40 | Speed: Tailwind ×2, Scarf ×1.5, +1 ×1.5 | `test/speed.test.js` | 338, 253 and 253 match hand calcs; no Champions change listed by Serebii or Bulbapedia |
| 41 | Paralysis halves Speed in Champions | `test/speed.test.js:17` | Serebii "Changed Status Conditions": Champions "Speed reduced to 50% of maximum" (only the full-paralysis chance changed, 25% to 12.5%) |
| 42 | Chlorophyll ×2 only in Sun | `test/speed.test.js:21-26` | standard ability; no Champions change listed |
| 43 | The 16 `ABILITY_TYPE_MODIFIERS` entries are correct | `src/typeMatrix.js:9-24` | Gen 9 effects (Dry Skin Fire 1.25, Thick Fat 0.5, Heatproof 0.5, Water Bubble 0.5, Purifying Salt Ghost 0.5, Fluffy Fire 2, immunities). Well-Baked Body and Storm Drain have no legal holder (harmless). The only gap is Eelevate (W1) |
| 44 | Format to mod mapping | docs:18-22, config.js:7-9 | `config/formats.ts:305-330`: M-C and Bo3 use `champions`; M-B uses `championsregmb` |
| 45 | Showdown format ruleset | `data/meta.json` | `['Flat Rules','VGC Timer','Open Team Sheets']`, matching formats.ts:310 |
| 46 | Files in the champions mod | docs:13-17 | `data/mods/champions/`: formats-data, items, learnsets, moves, abilities, conditions, rulesets, scripts (.ts) |
| 47 | "~250 `isNonstandard` entries" in items.ts | docs:16 | `grep -c isNonstandard` gives 250 |
| 48 | npm release lags (0.11.11) | `setup-showdown.js:2` | registry: latest 0.11.11, published 2026-07-28 (before M-C) |
| 49 | @smogon/calc models Champions as gen 0 | `src/calc.js:1,16` | `Generations.get(0)`; `stats.js:107` `if (gen.num === 0) return this.calcStatChampions` |
| 50 | Calc data matches the export apart from the Aegislash alias | src/README:165-167 | `test/calc-parity.test.js` passes (types, base stats, items, damaging-move type/category/BP) |
| 51 | Sirfetch'd is curly in the dex and straight in usage | `pipeline/README.md:122-124` | dex `"Sirfetch’d"`; raw usage key `"Sirfetch'd"`; both join as `sirfetchd` |
| 52 | Usage item, move and ability keys are already IDs; spreads are `Nature:HP/…/Spe` | pipeline/README:124,128; usage.js:24-26,41 | raw keys `occaberry`, `defiant`, `kowtowcleave`; `Brave:32/32/0/0/2/0` |
| 53 | Ability weights sum to the total weight; moves add up to about 400% | `usage.js:31,40` | Kingambit, Sneasler, Incineroar: ability, item and spread sums are equal; moves/abilities = 4.000 |
| 54 | Current C&C format `{n,p,d}` | `usage.js:15-21` | raw: `{"n":20.55,"p":0.4307,"d":0.1092}` |
| 55 | Raw files are about 19 MB | pipeline/README:117 | 19,022,848 bytes (live download 15.0 MB unformatted) |
| 56 | Showdown writes SPs on the `EVs:` line | `src/team.js:5,69` | `sim/teams.ts` exportSet: `out += \`EVs: ${stats.join(" / ")}\`` |
| 57 | Test item legality: Choice Band, Assault Vest and Booster Energy are not legal; Sitrus Berry, Chople Berry, Life Orb and Choice Scarf are | team.test.js:79, showdown.test.js:34, opponents.test.js | Serebii Champions item list |
| 58 | Battle-only formes of non-legal Pokémon are excluded (Ogerpon-Tera, Cramorant, Eiscue, Minior) | data.test.js:53-57 | none are on the official list |
| 59 | src/README example runs; likely sets are legal | src/README:136-143 | `topThreats(n:20)` gives 20 sets, all pass `validateTeam`; `calcMatchup` runs for all 277 usage Pokémon with 0 throws |
| 60 | otterlyclueless: CC BY 4.0, last commit 2026-04-16, has `mechanics/sp-system.md` and `stat-formula.md` | docs:56-59 | GitHub API (LICENSE "Creative Commons Attribution 4.0 International"; commit cb874a3 2026-04-16) |
| 61 | MunchStats has separate in-game usage formats | docs:39-40 | munchstats.com/about: "is not from Pokémon Showdown… We capture it ourselves"; "[Champions] In-Game" Singles/Doubles |
| 62 | GameWith counts formes separately and is still adding data; Victory Road URL resolves | docs:49-50 | GameWith: "counting each alternate form separately", "M-C data is still being added"; Victory Road returns 200 with an M-C section |

---

## 6. Coverage

**Checked**
- Pipeline: full `npm test`; vendor pin; `data:dex` re-export plus diff (`data/` was clean beforehand); `data:validate`; usage
  summary re-generation; raw usage compared with the live Smogon file; Smogon stats index for the formats and cutoffs.
- Regulation facts: official Pokémon Champions news page and the official in-game eligible-Pokémon list (262 entries), Bulbapedia
  (Regulation Set M-C, Stat point, Pokémon Champions), Serebii (M-C ranked page, items, Mega abilities, new abilities, updated
  attacks, status conditions), Victory Road, GameWith, MetaVGC, plus web search.
- Legality: every species (231) and every forme (269 vs 262) against the official list; every item (166) against Serebii;
  the M-B to M-C delta against Serebii and GameWith; Bulbapedia's species and Mega lists.
- Stats: 58 formes (45 parsed automatically, 13 checked by hand) against Bulbapedia, covering every Mega Z, every new M-C Mega,
  regional formes and staples.
- Abilities: all 82 Mega abilities (40 against Serebii's Champions list).
- Learnsets: 28 move pages and 1,120 species-move pairs against Bulbapedia's Champions tables, plus 25 specific test pairs.
- Moves: 23 Champions rebalances against Serebii.
- Mechanics: all 324 type-chart cells; stat formula; 6 damage calcs computed with my own Gen 9 implementation
  (pokeRound/chainMod, spread, weather, STAB, type, Reflect, Life Orb); speed modifiers; all 16 ability modifiers, plus a scan
  of legal abilities for missing type-based ones.
- Docs and comments: every statement in `docs/data-sources-plan.md`, `pipeline/README.md` and `src/README.md`; code comments
  in `pipeline/` and `src/`; every non-lockfile URL (10) for HTTP status and content.

**Skipped or partial**
- Pokémon-Zone (HTTP 403) and pokemon.com (I used the official champions-news.pokemon-home.com page and the in-game web view instead).
- The npm registry URLs in `package-lock.json` were not checked one by one. They are standard registry tarball links, and
  the lockfile was being changed by the user during the run.
- Learnsets were sampled (28 of 510 moves). Abilities of non-Mega species were spot-checked only through the infobox data used
  above, not for all 269 formes.
- Non-damaging move data (PP, priority, flags beyond the Serebii list) and item effects/fling power were not checked.
- New user files added during the run (`web/`, `vite.config.ts`, `docs/metagross-hydreigon-talonflame-team.md`, the react/vite
  dependencies) are out of scope.

**Repo state:** this audit changed no tracked files. Scratch work is in the session scratchpad. `data:dex` and `fetch-usage`
rewrote files with byte-identical content (`git diff data/` is empty). The only file written is this report.
