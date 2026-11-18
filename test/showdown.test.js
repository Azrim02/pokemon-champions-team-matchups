// Integration tests against the built Showdown sim. Skipped unless `npm run setup:showdown` has run.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SHOWDOWN, PATHS } from '../pipeline/config.js';
import { readJson } from '../pipeline/lib/io.js';
import { selectLegalSpecies } from '../pipeline/lib/species.js';

const marker = path.join(SHOWDOWN.dir, '.pinned-commit');
const built = fs.existsSync(marker) && fs.readFileSync(marker, 'utf8').trim() === SHOWDOWN.commit;
const skip = built ? false : 'Showdown not built at the pinned commit (run `npm run setup:showdown`)';

test('the Showdown format resolves to the champions mod', { skip }, async () => {
  const { loadFormat } = await import('../pipeline/lib/showdown.js');
  const { format } = loadFormat();
  assert.equal(format.mod, 'champions');
  assert.equal(format.gameType, 'doubles');
});

test('isLegalSpecies follows the Flat Rules', { skip }, async () => {
  const { loadFormat, isLegalSpecies } = await import('../pipeline/lib/showdown.js');
  const { dex, validator } = loadFormat();
  const legal = id => isLegalSpecies(validator, dex.species.get(id));
  assert.equal(legal('incineroar'), true);
  assert.equal(legal('mew'), false); // Mythical
  assert.equal(legal('bulbasaur'), false); // not in Champions
});

test('isLegalItem rejects items Champions does not have', { skip }, async () => {
  const { loadFormat, isLegalItem } = await import('../pipeline/lib/showdown.js');
  const { dex, validator } = loadFormat();
  assert.equal(isLegalItem(validator, dex.items.get('leftovers')), true);
  assert.equal(isLegalItem(validator, dex.items.get('boosterenergy')), false);
});

test('committed data/pokemon.json is up to date with the pinned Showdown commit', { skip }, async () => {
  const { loadFormat, isLegalSpecies } = await import('../pipeline/lib/showdown.js');
  const { dex, validator } = loadFormat();
  const expected = selectLegalSpecies(dex.species.all(), s => isLegalSpecies(validator, s)).map(s => s.id);
  const actual = readJson(path.join(PATHS.data, 'pokemon.json')).map(p => p.id);
  assert.deepEqual(actual, expected, 'run `npm run data:dex` to regenerate');
});
