import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectLegalSpecies, buildTypechart } from '../pipeline/lib/species.js';

const sp = (name, extra = {}) => ({ name, exists: true, ...extra });
const all = [
  sp('Palafin'),
  sp('Palafin-Hero', { battleOnly: 'Palafin' }),
  sp('Garchomp'),
  sp('Garchomp-Mega', { battleOnly: 'Garchomp' }),
  sp('Ogerpon', { illegal: true }),
  sp('Ogerpon-Wellspring-Tera', { battleOnly: 'Ogerpon-Wellspring' }),
  sp('Vivillon'),
  sp('Vivillon-Polar', { isCosmeticForme: true }),
  sp('Missingno', { exists: false }),
  sp('Necrozma-Ultra', { battleOnly: ['Necrozma-Dawn-Wings', 'Necrozma-Dusk-Mane'] }),
  sp('Necrozma-Dusk-Mane'),
];
const names = list => list.map(s => s.name);
const pick = () => selectLegalSpecies(all, s => !s.illegal);

test('keeps legal species and their battle-only formes, sorted by name', () => {
  assert.deepEqual(names(pick()), [
    'Garchomp', 'Garchomp-Mega', 'Necrozma-Dusk-Mane', 'Necrozma-Ultra', 'Palafin', 'Palafin-Hero', 'Vivillon',
  ]);
});

test('drops battle-only formes whose out-of-battle forme is not legal', () => {
  assert.ok(!names(pick()).includes('Ogerpon-Wellspring-Tera'));
});

test('accepts battle-only formes reachable from any one of several formes', () => {
  assert.ok(names(pick()).includes('Necrozma-Ultra'));
});

test('drops cosmetic formes and non-existent species', () => {
  assert.ok(!names(pick()).includes('Vivillon-Polar'));
  assert.ok(!names(pick()).includes('Missingno'));
});

test('a battle-only forme does not count as a legal out-of-battle forme', () => {
  const chain = [sp('A-Mega', { battleOnly: 'A' }), sp('A-Mega-Z', { battleOnly: 'A-Mega' })];
  assert.deepEqual(names(selectLegalSpecies(chain, () => true)), []);
});

test('buildTypechart maps damageTaken codes to multipliers as chart[attacker][defender]', () => {
  const chart = buildTypechart([
    { name: 'Ground', damageTaken: { Ground: 0, Electric: 3, Water: 1, Flying: 0 } },
    { name: 'Flying', damageTaken: { Ground: 3, Electric: 1, Grass: 2 } },
  ]);
  assert.equal(chart.Ground.Flying, 0);
  assert.equal(chart.Flying.Ground, 1);
  assert.equal(chart.Ground.Ground, 1);
  assert.deepEqual(Object.keys(chart), ['Ground', 'Flying']);
});
