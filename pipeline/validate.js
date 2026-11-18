// Sanity-checks the exported data, and compares it to hand-maintained reference lists
// (data/reference/regulation-m-c.json, copied from Bulbapedia / Pokémon-Zone) if present.
// Usage: npm run data:validate
import fs from 'node:fs';
import path from 'node:path';
import { PATHS } from './config.js';
import { readJson } from './lib/io.js';

const load = f => readJson(path.join(PATHS.data, f));
const pokemon = load('pokemon.json');
const items = load('items.json');
const moves = load('moves.json');
const abilities = load('abilities.json');
const learnsets = load('learnsets.json');

const errors = [];
const warnings = [];

// --- Internal consistency --------------------------------------------------
const ids = arr => new Set(arr.map(x => x.id));
const pokemonIds = ids(pokemon), itemIds = ids(items), moveIds = ids(moves);
const abilityNames = new Set(abilities.map(a => a.name));
const pokemonNames = new Set(pokemon.map(p => p.name));

for (const [label, arr, set] of [['pokemon', pokemon, pokemonIds], ['items', items, itemIds], ['moves', moves, moveIds]]) {
  if (set.size !== arr.length) errors.push(`${label}: duplicate ids`);
}
for (const p of pokemon) {
  for (const a of Object.values(p.abilities)) if (!abilityNames.has(a)) errors.push(`${p.name}: unknown ability ${a}`);
  if (!learnsets[p.id]?.length) errors.push(`${p.name}: empty learnset`);
  for (const m of learnsets[p.id] ?? []) if (!moveIds.has(m)) errors.push(`${p.name}: unknown move ${m}`);
  if (p.isMega && !items.some(i => i.name === p.requiredItem)) errors.push(`${p.name}: Mega Stone ${p.requiredItem} not legal`);
}
for (const i of items.filter(i => i.category === 'mega-stone')) {
  for (const { from } of i.megaEvolves) if (!pokemonNames.has(from)) errors.push(`${i.name}: ${from} not legal`);
}

// --- Compare with reference lists -----------------------------------------
// Expected shape: { "source": "...", "pokemon": ["Incineroar", ...], "items": ["Sitrus Berry", ...] }
const refFile = path.join(PATHS.reference, 'regulation-m-c.json');
if (fs.existsSync(refFile)) {
  const ref = readJson(refFile);
  const toId = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const diff = (label, ours, theirs) => {
    const o = new Set(ours.map(toId)), t = new Set(theirs.map(toId));
    const missing = theirs.filter(x => !o.has(toId(x)));
    const extra = ours.filter(x => !t.has(toId(x)));
    if (missing.length) warnings.push(`${label} in reference but not exported (${missing.length}): ${missing.join(', ')}`);
    if (extra.length) warnings.push(`${label} exported but not in reference (${extra.length}): ${extra.join(', ')}`);
  };
  if (ref.pokemon) diff('Pokémon', [...new Set(pokemon.filter(p => !p.battleOnly).map(p => p.name))], ref.pokemon);
  if (ref.items) diff('Items', items.map(i => i.name), ref.items);
} else {
  warnings.push(`No reference list at ${path.relative(process.cwd(), refFile)}; skipped comparison against external lists.`);
}

// --- Report ----------------------------------------------------------------
for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(`\n${pokemon.length} Pokémon, ${items.length} items, ${moves.length} moves, ${abilities.length} abilities — ` +
  `${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
