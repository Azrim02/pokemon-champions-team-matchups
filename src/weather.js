// Weather set by abilities. The dashboard's "weather from setters" mode uses this so that a
// pairing involving a setter (Charizard-Mega-Y, Pelipper…) is calc'd in that setter's weather,
// instead of one weather for the whole grid.
import { speedOf } from './speed.js';

/** Abilities that set weather on entry (or on Mega Evolution). */
export const WEATHER_ABILITIES = { Drought: 'Sun', Drizzle: 'Rain', 'Sand Stream': 'Sand', 'Snow Warning': 'Snow' };

/** The Mega forme a set battles as, or null (respects `state.mega === false`). */
const megaOf = (set, dataset) => (set.state?.mega === false ? null : dataset.megaFormeFor(set.species, set.item));

/** The ability a set battles with: its Mega forme's ability if it holds its Mega Stone. */
export function battleAbility(set, dataset) {
  const mega = megaOf(set, dataset);
  return mega ? Object.values(dataset.getPokemon(mega).abilities)[0] : set.ability;
}

/** 'Sun' | 'Rain' | 'Sand' | 'Snow' if the set's battle ability sets weather, else null. */
export function setterWeather(set, dataset) {
  return WEATHER_ABILITIES[battleAbility(set, dataset)] ?? null;
}

/**
 * Weather for a one-on-one pairing when both lead: a setter's weather beats `fallback`. If both
 * set weather, the one that activates last wins. Mega Evolution happens at the start of turn 1,
 * after switch-in abilities, so a Mega setter beats a regular one. Otherwise the slower
 * Pokémon's ability activates last. On a Speed tie (random in game) `a` wins.
 */
export function pairingWeather(a, b, dataset, fallback = null) {
  const wa = setterWeather(a, dataset);
  const wb = setterWeather(b, dataset);
  if (!wa || !wb || wa === wb) return wa ?? wb ?? fallback;
  const ma = !!megaOf(a, dataset);
  const mb = !!megaOf(b, dataset);
  if (ma !== mb) return ma ? wa : wb;
  return speedOf(a, dataset) <= speedOf(b, dataset) ? wa : wb;
}
