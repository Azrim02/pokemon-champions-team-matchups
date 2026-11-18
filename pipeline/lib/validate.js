import { toId } from './usage.js';

/**
 * Checks the exported dataset for internal consistency, and diffs it against a reference list
 * ({ pokemon: [names], items: [names] }) when one is given.
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateDataset({ pokemon, items, moves, abilities, learnsets }, reference = null) {
  const errors = [];
  const warnings = [];

  for (const [label, arr] of [['pokemon', pokemon], ['items', items], ['moves', moves]]) {
    const seen = new Set();
    for (const x of arr) {
      if (seen.has(x.id)) errors.push(`${label}: duplicate id ${x.id}`);
      seen.add(x.id);
    }
  }

  const moveIds = new Set(moves.map(m => m.id));
  const itemNames = new Set(items.map(i => i.name));
  const abilityNames = new Set(abilities.map(a => a.name));
  const pokemonNames = new Set(pokemon.map(p => p.name));

  for (const p of pokemon) {
    for (const a of Object.values(p.abilities)) if (!abilityNames.has(a)) errors.push(`${p.name}: unknown ability ${a}`);
    if (!learnsets[p.id]?.length) errors.push(`${p.name}: empty learnset`);
    for (const m of learnsets[p.id] ?? []) if (!moveIds.has(m)) errors.push(`${p.name}: unknown move ${m}`);
    if (p.isMega && !itemNames.has(p.requiredItem)) errors.push(`${p.name}: Mega Stone ${p.requiredItem} not legal`);
  }
  for (const i of items.filter(i => i.category === 'mega-stone')) {
    for (const { from, to } of i.megaEvolves) {
      if (!pokemonNames.has(from)) errors.push(`${i.name}: ${from} not legal`);
      if (!pokemonNames.has(to)) errors.push(`${i.name}: ${to} not legal`);
    }
  }

  if (reference) {
    const diff = (label, ours, theirs) => {
      const o = new Set(ours.map(toId));
      const t = new Set(theirs.map(toId));
      const missing = theirs.filter(x => !o.has(toId(x)));
      const extra = ours.filter(x => !t.has(toId(x)));
      if (missing.length) warnings.push(`${label} in reference but not exported (${missing.length}): ${missing.join(', ')}`);
      if (extra.length) warnings.push(`${label} exported but not in reference (${extra.length}): ${extra.join(', ')}`);
    };
    // Reference lists name what you can register, so compare against out-of-battle formes only.
    if (reference.pokemon) diff('Pokémon', pokemon.filter(p => !p.battleOnly).map(p => p.name), reference.pokemon);
    if (reference.items) diff('Items', items.map(i => i.name), reference.items);
  }

  return { errors, warnings };
}
