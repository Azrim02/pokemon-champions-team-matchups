// Lookup layer over the exported JSON in data/. Browser-safe: the caller loads the JSON
// (fetch / import / fs) and passes it in, so this module has no I/O of its own.

/** Showdown-style ID: lowercase alphanumerics only ("Sirfetch’d" → "sirfetchd"). */
export const toId = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');

/** Champions Stat Point caps (from Showdown's validator for the M-C format). */
export const SP_LIMITS = { perStat: 32, total: 66 };
export const STAT_IDS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

/**
 * @param {{pokemon: object[], items: object[], moves: object[], abilities: object[],
 *          learnsets: Record<string, string[]>, typechart: Record<string, Record<string, number>>}} json
 */
export function createDataset(json) {
  const index = arr => new Map(arr.map(x => [x.id, x]));
  const pokemon = index(json.pokemon);
  const items = index(json.items);
  const moves = index(json.moves);
  const abilities = new Map(json.abilities.map(a => [toId(a.name), a]));
  const learnsets = new Map(Object.entries(json.learnsets).map(([id, ms]) => [id, new Set(ms)]));

  return {
    raw: json,
    typechart: json.typechart,
    types: Object.keys(json.typechart),
    getPokemon: name => pokemon.get(toId(name)) ?? null,
    getItem: name => items.get(toId(name)) ?? null,
    getMove: name => moves.get(toId(name)) ?? null,
    getAbility: name => abilities.get(toId(name)) ?? null,
    canLearn: (species, move) => learnsets.get(toId(species))?.has(toId(move)) ?? false,
    /** The Mega forme a species turns into when holding `item`, or null. */
    megaFormeFor(species, item) {
      const stone = items.get(toId(item));
      const sp = pokemon.get(toId(species));
      if (!stone || !sp || stone.category !== 'mega-stone') return null;
      return stone.megaEvolves.find(m => m.from === sp.name)?.to ?? null;
    },
  };
}
