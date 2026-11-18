import path from 'node:path';
import { PATHS } from '../../pipeline/config.js';
import { readJson } from '../../pipeline/lib/io.js';
import { createDataset } from '../../src/data.js';

const load = f => readJson(path.join(PATHS.data, f));

/** The real exported M-C dataset, as the dashboard would load it. */
export const dataset = createDataset({
  pokemon: load('pokemon.json'),
  items: load('items.json'),
  moves: load('moves.json'),
  abilities: load('abilities.json'),
  learnsets: load('learnsets.json'),
  typechart: load('typechart.json'),
});

/** A set with sensible defaults; override any field. */
export const set = (species, extra = {}) => ({
  name: '', species, item: '', ability: '', nature: 'Serious', gender: '',
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, moves: [], ...extra,
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...extra.evs },
});
