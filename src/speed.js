// Speed tiers, using @smogon/calc's own final-Speed logic (Tailwind, Choice Scarf, paralysis,
// weather abilities, Unburden, boosts…) so they agree with the damage calc.
import { Field, Side } from '@smogon/calc';
import { getFinalSpeed } from '@smogon/calc/dist/mechanics/util.js';
import { gen, toCalcPokemon } from './calc.js';

/**
 * Final Speed of a set.
 * @param {object} set team set (battle state in `set.state`, e.g. { boosts: { spe: 1 } })
 * @param {{weather?, terrain?, side?: {isTailwind?: boolean}}} conditions
 */
export function speedOf(set, dataset, conditions = {}) {
  const { side = {}, ...field } = conditions;
  return getFinalSpeed(gen, toCalcPokemon(set, dataset), new Field(field), new Side(side));
}

/**
 * Sorts entries into move order. Under Trick Room the slowest goes first.
 * @param {{label: string, set: object, side?: object, group?: string}[]} entries
 *        `side` is that Pokémon's side conditions (e.g. { isTailwind: true }); `group` is free text
 *        such as 'mine' / 'theirs' for the dashboard to colour by.
 * @param {{weather?, terrain?, trickRoom?: boolean}} conditions
 * @returns {{label, group, speed, tier}[]} `tier` is shared by entries with the same Speed (speed ties)
 */
export function speedTiers(entries, dataset, { trickRoom = false, ...field } = {}) {
  const rows = entries.map(e => ({
    label: e.label || e.set.name || e.set.species,
    group: e.group ?? null,
    speed: speedOf(e.set, dataset, { ...field, side: e.side ?? {} }),
  }));
  rows.sort((a, b) => (trickRoom ? a.speed - b.speed : b.speed - a.speed) || a.label.localeCompare(b.label));
  let tier = 0;
  rows.forEach((r, i) => { if (i === 0 || r.speed !== rows[i - 1].speed) tier++; r.tier = tier; });
  return rows;
}

/** 'faster' | 'slower' | 'tie' for `a` against `b`, accounting for Trick Room. */
export function compareSpeed(aSpeed, bSpeed, { trickRoom = false } = {}) {
  if (aSpeed === bSpeed) return 'tie';
  return (aSpeed > bSpeed) !== trickRoom ? 'faster' : 'slower';
}
