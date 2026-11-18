// Damage calc wrapper around @smogon/calc's Champions mechanics (generation 0 in the calc).
//
// Conditions shape (all optional):
//   {
//     gameType: 'Doubles' | 'Singles',   // default 'Doubles' (spread moves get the 0.75x reduction)
//     weather: 'Sun' | 'Rain' | 'Sand' | 'Snow' | …, terrain: 'Electric' | 'Grassy' | 'Psychic' | 'Misty',
//     isGravity, isMagicRoom, isWonderRoom,
//     mySide:  { isTailwind, isReflect, isLightScreen, isAuroraVeil, isHelpingHand, isFriendGuard, … },
//     oppSide: { …same keys… },
//   }
// Per-Pokémon battle state goes on the set as `set.state`:
//   { boosts: {atk: 1, …}, status: 'brn' | 'par' | …, curHPPct: 100, abilityOn: false, mega: true }

import { Generations, Pokemon, Move, Field, calculate, toID } from '@smogon/calc';

/** @smogon/calc models Pokémon Champions as generation 0. */
export const gen = Generations.get(0);

/** Showdown names that @smogon/calc spells differently (checked by test/calc-parity.test.js). */
export const CALC_SPECIES_ALIASES = { Aegislash: 'Aegislash-Shield' };

/**
 * Builds a calc Pokémon from a team set. Holding its Mega Stone, a Pokémon is calc'd as its
 * Mega forme unless `state.mega === false`, since that's the forme it will battle in.
 */
export function toCalcPokemon(set, dataset, state = set.state ?? {}) {
  let species = CALC_SPECIES_ALIASES[set.species] ?? set.species;
  let ability = set.ability;
  const megaForme = state.mega === false ? null : dataset?.megaFormeFor(set.species, set.item);
  if (megaForme) {
    species = megaForme;
    ability = Object.values(dataset.getPokemon(megaForme).abilities)[0]; // Megas have one ability
  }
  if (!gen.species.get(toID(species))) throw new Error(`@smogon/calc has no data for ${species}`);
  const pokemon = new Pokemon(gen, species, {
    item: set.item || undefined,
    ability: ability || undefined,
    nature: set.nature || undefined,
    evs: set.evs, // Champions Stat Points
    boosts: state.boosts,
    status: state.status || '',
    abilityOn: state.abilityOn,
  });
  if (state.curHPPct != null) {
    pokemon.originalCurHP = Math.max(1, Math.round((pokemon.maxHP() * state.curHPPct) / 100));
  }
  return pokemon;
}

/** Builds the calc Field from the attacker's point of view. */
export function toField(conditions = {}, { reverse = false } = {}) {
  const { mySide = {}, oppSide = {}, gameType = 'Doubles', ...rest } = conditions;
  return new Field({
    ...rest,
    gameType,
    attackerSide: reverse ? oppSide : mySide,
    defenderSide: reverse ? mySide : oppSide,
  });
}

const round1 = n => Math.round(n * 10) / 10;

/** Flattens the calc's damage (number | number[] | number[][] for multi-hit) to one roll per random factor. */
function rolls(damage) {
  if (typeof damage === 'number') return [damage];
  if (Array.isArray(damage[0])) return damage[0].map((_, i) => damage.reduce((sum, hit) => sum + hit[i], 0));
  return damage;
}

/**
 * Calcs one move. Status moves come back with `damage: null`.
 * @returns {{move, type, category, damage: [number, number] | null, percent: [number, number] | null,
 *            rolls: number[], koChance: string, desc: string}}
 */
export function calcMove(attacker, defender, moveName, field) {
  const move = new Move(gen, moveName);
  const base = { move: move.name, type: move.type, category: move.category, basePower: move.bp };
  if (move.category === 'Status') {
    return { ...base, damage: null, percent: null, rolls: [], koChance: '', desc: '' };
  }
  const result = calculate(gen, attacker, defender, move, field);
  const all = rolls(result.damage);
  const [min, max] = [Math.min(...all), Math.max(...all)];
  const hp = defender.maxHP();
  // desc() and kochance() throw when a move does no damage (e.g. immunities).
  const safe = fn => { try { return fn(); } catch { return ''; } };
  return {
    ...base,
    damage: [min, max],
    percent: [round1((min / hp) * 100), round1((max / hp) * 100)],
    rolls: all,
    koChance: max === 0 ? 'no damage' : safe(() => result.kochance().text),
    desc: safe(() => result.desc()),
  };
}

/** Calcs every move of `attackerSet` into `defenderSet`. */
export function calcSetVsSet(attackerSet, defenderSet, dataset, conditions = {}, { reverse = false } = {}) {
  const attacker = toCalcPokemon(attackerSet, dataset);
  const defender = toCalcPokemon(defenderSet, dataset);
  const field = toField(conditions, { reverse });
  return attackerSet.moves.filter(Boolean).map(m => calcMove(attacker, defender, m, field));
}

/**
 * Raw calc lists for every pairing of your team against an opponent team, both directions.
 * @returns {{mine: string, theirs: string, myMoves: object[], theirMoves: object[]}[]}
 */
export function calcMatchup(myTeam, oppTeam, dataset, conditions = {}) {
  const out = [];
  for (const mine of myTeam) {
    for (const theirs of oppTeam) {
      out.push({
        mine: mine.name || mine.species,
        theirs: theirs.name || theirs.species,
        myMoves: calcSetVsSet(mine, theirs, dataset, conditions),
        theirMoves: calcSetVsSet(theirs, mine, dataset, conditions, { reverse: true }),
      });
    }
  }
  return out;
}

