// Exports every Pokémon, item, move and ability legal in the configured regulation to data/*.json.
// Usage: npm run data:dex
import path from 'node:path';
import { PATHS, REGULATION, SHOWDOWN } from './config.js';
import { loadFormat, isLegalSpecies, isLegalItem } from './lib/showdown.js';
import { writeJson } from './lib/io.js';
import { selectLegalSpecies, buildTypechart } from './lib/species.js';

const { format, dex, validator } = loadFormat();
const byName = (a, b) => a.name.localeCompare(b.name);

// --- Pokémon ---------------------------------------------------------------
const legalSpecies = selectLegalSpecies(dex.species.all(), s => isLegalSpecies(validator, s));
const legalSpeciesIds = new Set(legalSpecies.map(s => s.id));

const learnsets = {};
for (const s of legalSpecies) {
  learnsets[s.id] = [...dex.species.getMovePool(s.id)]
    .filter(id => { const m = dex.moves.get(id); return m.exists && !m.isNonstandard; })
    .sort();
}

const pokemon = legalSpecies.map(s => ({
  id: s.id,
  name: s.name,
  num: s.num,
  baseSpecies: s.baseSpecies,
  forme: s.forme || null,
  types: s.types,
  baseStats: s.baseStats,
  bst: s.bst,
  abilities: s.abilities,
  weightkg: s.weightkg,
  isMega: !!s.isMega,
  battleOnly: s.battleOnly ?? null, // the out-of-battle forme this changes from (Megas, Aegislash-Blade…)
  requiredItem: s.requiredItem ?? null, // e.g. the Mega Stone
  otherFormes: (s.otherFormes ?? []).filter(id => legalSpeciesIds.has(dex.species.get(id).id)),
  cosmeticFormes: s.cosmeticFormes ?? [],
  tags: s.tags ?? [],
  tier: s.tier,
  doublesTier: s.doublesTier,
}));

// --- Items -----------------------------------------------------------------
const megaByStone = {};
for (const s of legalSpecies) {
  if (!s.isMega || !s.requiredItem) continue;
  const stone = dex.items.get(s.requiredItem).id;
  (megaByStone[stone] ??= []).push({ from: s.battleOnly ?? s.baseSpecies, to: s.name });
}

const items = dex.items.all()
  .filter(i => isLegalItem(validator, i))
  .sort(byName)
  .map(i => ({
    id: i.id,
    name: i.name,
    num: i.num,
    category: megaByStone[i.id] ? 'mega-stone' : i.isBerry ? 'berry' : 'held',
    megaEvolves: megaByStone[i.id] ?? [],
    shortDesc: i.shortDesc || i.desc,
    desc: i.desc,
    flingBasePower: i.fling?.basePower ?? null,
  }));

// --- Moves (only those some legal Pokémon can learn) ------------------------
const learnableMoves = new Set(Object.values(learnsets).flat());
const moves = [...learnableMoves]
  .map(id => dex.moves.get(id))
  .sort(byName)
  .map(m => ({
    id: m.id,
    name: m.name,
    type: m.type,
    category: m.category,
    basePower: m.basePower,
    accuracy: m.accuracy, // `true` = never misses
    pp: m.pp,
    priority: m.priority,
    target: m.target,
    flags: Object.keys(m.flags),
    secondary: m.secondary ?? null,
    shortDesc: m.shortDesc || m.desc,
  }));

// --- Abilities (only those some legal Pokémon can have) ---------------------
const abilityNames = new Set(pokemon.flatMap(p => Object.values(p.abilities)));
const abilities = [...abilityNames]
  .map(name => dex.abilities.get(name))
  .sort(byName)
  .map(a => ({ id: a.id, name: a.name, shortDesc: a.shortDesc || a.desc, desc: a.desc }));

// --- Type chart: typechart[attacking][defending] = multiplier ---------------
// Stellar only exists for Terastallization, which Champions doesn't have.
const typechart = buildTypechart(dex.types.all().filter(t => !t.isNonstandard && t.name !== 'Stellar'));

// --- Write -----------------------------------------------------------------
const meta = {
  regulation: REGULATION,
  showdownFormat: format.name,
  showdownCommit: SHOWDOWN.commit,
  ruleset: format.ruleset,
  // No timestamp on purpose: output is deterministic for a given commit, so git diffs stay clean.
  counts: {
    pokemon: pokemon.length,
    baseSpecies: new Set(pokemon.map(p => p.baseSpecies)).size,
    megas: pokemon.filter(p => p.isMega).length,
    items: items.length,
    megaStones: items.filter(i => i.category === 'mega-stone').length,
    moves: moves.length,
    abilities: abilities.length,
  },
};

const out = f => path.join(PATHS.data, f);
writeJson(out('pokemon.json'), pokemon);
writeJson(out('learnsets.json'), learnsets);
writeJson(out('items.json'), items);
writeJson(out('moves.json'), moves);
writeJson(out('abilities.json'), abilities);
writeJson(out('typechart.json'), typechart);
writeJson(out('meta.json'), meta);

console.log(`Exported ${format.name} data to data/:`);
console.table(meta.counts);
