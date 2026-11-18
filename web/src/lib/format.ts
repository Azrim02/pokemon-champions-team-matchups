import type { Dataset, MoveCalc, PokemonSet } from '../types';

export const label = (set: PokemonSet) => set.name || set.species;

/** Species shown in battle: the Mega forme when holding its Mega Stone. */
export function battleForme(set: PokemonSet, dataset: Dataset) {
  const mega = set.state?.mega === false ? null : dataset.megaFormeFor(set.species, set.item);
  return mega ?? set.species;
}

/** The damaging move with the highest max roll. */
export function bestMove(moves: MoveCalc[]): MoveCalc | null {
  let best: MoveCalc | null = null;
  for (const m of moves) {
    if (!m.percent) continue;
    if (!best || m.percent[1] > best.percent![1]) best = m;
  }
  return best;
}

export const pctRange = (m: MoveCalc) => (m.percent ? `${m.percent[0]}–${m.percent[1]}%` : '—');

/** Damage band for colouring: KO from full, over half, or less. */
export function band(m: MoveCalc | null): 'ko' | 'heavy' | 'light' | 'none' {
  if (!m?.percent || m.percent[1] === 0) return 'none';
  if (m.percent[0] >= 100) return 'ko';
  if (m.percent[1] >= 50) return 'heavy';
  return 'light';
}

/** Same rule as compareSpeed in src/speed.js (kept here so the main bundle doesn't load the calc). */
export function compareSpeed(a: number, b: number, trickRoom: boolean): 'faster' | 'slower' | 'tie' {
  if (a === b) return 'tie';
  return (a > b) !== trickRoom ? 'faster' : 'slower';
}

const FRACTIONS: Record<number, string> = { 0: '0', 0.25: '¼', 0.5: '½', 1: '1', 2: '2', 4: '4' };
export const multiplier = (m: number) => FRACTIONS[m] ?? String(Math.round(m * 100) / 100);
