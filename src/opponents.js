// Builds likely opponent sets from a usage summary (data/usage/<month>/<format>-<cutoff>.json).
//
// The usage stats give each field (item, ability, spread, moves) separately, not whole sets,
// so a "likely set" combines the most common choice for each field. The usage numbers are kept
// on the set so the dashboard can show how confident each guess is.

import { STAT_IDS } from './data.js';

/** "Adamant:2/32/0/0/0/32" → { nature: 'Adamant', evs: { hp: 2, atk: 32, … } } */
export function parseSpread(spread) {
  const [nature, values] = spread.split(':');
  const nums = values.split('/').map(Number);
  return { nature, evs: Object.fromEntries(STAT_IDS.map((s, i) => [s, nums[i] ?? 0])) };
}

/**
 * Likely sets for one Pokémon from its usage entry: one set per top spread (up to `spreads`),
 * all sharing the most common item, ability and four moves.
 * @param {object} entry one element of usageSummary.pokemon
 * @returns {object[]} team sets, each with a `usage` block describing the guess
 */
export function likelySets(entry, dataset, { spreads = 1 } = {}) {
  const seen = dataset.getPokemon(entry.id);
  if (!seen) return [];
  // Usage stats list Megas under their Mega forme ("Charizard-Mega-Y"). Register the base
  // forme instead; the calc switches back to the Mega because the set holds the Mega Stone.
  const species = seen.battleOnly ? dataset.getPokemon([seen.battleOnly].flat()[0]) : seen;
  const canHave = a => Object.values(species.abilities).includes(dataset.getAbility(a.id)?.name);

  const item = entry.items.find(i => i.id !== 'nothing' && dataset.getItem(i.id));
  const ability = entry.abilities.find(a => dataset.getAbility(a.id) && canHave(a));
  const moves = entry.moves.filter(m => m.id && dataset.getMove(m.id)).slice(0, 4);
  const topSpreads = entry.spreads.length ? entry.spreads.slice(0, spreads) : [null];

  return topSpreads.map(s => ({
    name: '',
    species: species.name,
    item: item ? dataset.getItem(item.id).name : '',
    ability: ability ? dataset.getAbility(ability.id).name : Object.values(species.abilities)[0],
    gender: '',
    ...(s ? parseSpread(s.spread) : { nature: 'Serious', evs: Object.fromEntries(STAT_IDS.map(k => [k, 0])) }),
    moves: moves.map(m => dataset.getMove(m.id).name),
    usage: {
      seenAs: seen.name,
      usagePct: entry.usagePct,
      itemPct: item?.pct ?? null,
      abilityPct: ability?.pct ?? null,
      spreadPct: s?.pct ?? null,
      movePcts: moves.map(m => m.pct),
    },
  }));
}

/**
 * Likely sets for a list of opponent Pokémon (names or IDs), e.g. a team seen at team preview.
 * Pokémon missing from the usage stats come back with `sets: []`.
 */
export function likelyTeam(names, usageSummary, dataset, options) {
  const byId = new Map(usageSummary.pokemon.map(p => [p.id, p]));
  return names.map(name => {
    const species = dataset.getPokemon(name);
    const entry = species && byId.get(species.id);
    return { species: species?.name ?? name, sets: entry ? likelySets(entry, dataset, options) : [] };
  });
}

/** The `n` most used Pokémon in the usage summary, each with its likely sets. */
export function topThreats(usageSummary, dataset, { n = 20, ...options } = {}) {
  return usageSummary.pokemon.slice(0, n)
    .map(entry => ({ species: entry.name, usagePct: entry.usagePct, sets: likelySets(entry, dataset, options) }))
    .filter(t => t.sets.length);
}
