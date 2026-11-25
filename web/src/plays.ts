// Play guides made by tools/doubles-sim/guide.mjs from simulated Doubles games, one per team id.
import { toId } from './core';
import type { PlayGuide, PokemonSet } from './types';

const files = import.meta.glob<PlayGuide>('./plays/*.json', { import: 'default', eager: true });
const guides = Object.values(files);

/** The guide for these six Pokémon, and which of them differ (item or moves) from the sets it was made with. */
export function guideFor(sets: PokemonSet[]): { guide: PlayGuide; changed: string[] } | null {
  const key = (names: string[]) => names.map(toId).sort().join();
  const changedIn = (g: PlayGuide) => g.sets.filter(a => {
    const b = sets.find(s => toId(s.species) === toId(a.species));
    return !b || toId(b.item) !== toId(a.item) || key(b.moves) !== key(a.moves);
  }).map(s => s.species);
  return guides.filter(g => key(g.species) === key(sets.map(s => s.species)))
    .map(guide => ({ guide, changed: changedIn(guide) }))
    .sort((a, b) => a.changed.length - b.changed.length)[0] ?? null;
}
