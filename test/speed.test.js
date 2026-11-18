import { test } from 'node:test';
import assert from 'node:assert/strict';
import { speedOf, speedTiers, compareSpeed } from '../src/speed.js';
import { dataset, set } from './helpers/dataset.js';

// Garchomp: base 102 Spe. Neutral nature + 32 SP = 154; Jolly = floor(154 * 1.1) = 169.
const chomp = (extra = {}) => set('Garchomp', { ability: 'Rough Skin', nature: 'Jolly', evs: { spe: 32 }, ...extra });

test('final Speed applies nature and Stat Points', () => {
  assert.equal(speedOf(chomp(), dataset), 169);
  assert.equal(speedOf(chomp({ nature: 'Serious' }), dataset), 154);
});

test('Choice Scarf, Tailwind, paralysis and boosts modify Speed', () => {
  assert.equal(speedOf(chomp({ item: 'Choice Scarf' }), dataset), Math.floor(169 * 1.5));
  assert.equal(speedOf(chomp(), dataset, { side: { isTailwind: true } }), 338);
  assert.equal(speedOf(chomp({ state: { status: 'par' } }), dataset), Math.floor(169 / 2));
  assert.equal(speedOf(chomp({ state: { boosts: { spe: 1 } } }), dataset), Math.floor(169 * 1.5));
});

test('weather Speed abilities apply only in their weather', () => {
  const venusaur = set('Venusaur', { ability: 'Chlorophyll', nature: 'Serious', evs: { spe: 0 } });
  const base = speedOf(venusaur, dataset);
  assert.equal(speedOf(venusaur, dataset, { weather: 'Sun' }), base * 2);
  assert.equal(speedOf(venusaur, dataset, { weather: 'Rain' }), base);
});

test('speedTiers sorts fastest first, groups ties, and reverses under Trick Room', () => {
  const entries = [
    { set: set('Incineroar', { ability: 'Intimidate' }), group: 'mine' },
    { set: chomp(), group: 'theirs' },
    { label: 'Chomp B', set: chomp(), group: 'mine' },
  ];
  const tiers = speedTiers(entries, dataset);
  assert.deepEqual(tiers.map(t => t.label), ['Chomp B', 'Garchomp', 'Incineroar']);
  assert.deepEqual(tiers.map(t => t.tier), [1, 1, 2]);
  assert.deepEqual(speedTiers(entries, dataset, { trickRoom: true }).map(t => t.label), ['Incineroar', 'Chomp B', 'Garchomp']);
});

test('speedTiers applies each entry\'s own side conditions', () => {
  const tiers = speedTiers([
    { set: chomp(), side: { isTailwind: true } },
    { set: chomp({ item: 'Choice Scarf' }), label: 'Scarf Chomp' },
  ], dataset);
  assert.deepEqual(tiers.map(t => [t.label, t.speed]), [['Garchomp', 338], ['Scarf Chomp', 253]]);
});

test('compareSpeed accounts for Trick Room', () => {
  assert.equal(compareSpeed(100, 90), 'faster');
  assert.equal(compareSpeed(100, 90, { trickRoom: true }), 'slower');
  assert.equal(compareSpeed(90, 90), 'tie');
});
