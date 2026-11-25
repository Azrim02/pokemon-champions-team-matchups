import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defensiveCores } from '../src/cores.js';
import { teamDefense } from '../src/typeMatrix.js';
import { dataset, set } from './helpers/dataset.js';

const metagross = set('Metagross', { item: 'Metagrossite', ability: 'Clear Body' });
const hydreigon = set('Hydreigon', { ability: 'Levitate' });
const talonflame = set('Talonflame', { ability: 'Gale Wings' });
const cores = team => defensiveCores(teamDefense(team, dataset));

test('links list the weaknesses a teammate resists or is immune to', () => {
  const { weaknesses, links } = cores([metagross, hydreigon]);
  assert.deepEqual([...weaknesses[0]].sort(), ['Dark', 'Fire', 'Ghost', 'Ground']);
  const types = (of, by) => [...links.find(l => l.of === of && l.by === by).types].sort();
  assert.deepEqual(types(0, 1), ['Dark', 'Fire', 'Ghost', 'Ground']); // Ground through Levitate
  assert.deepEqual(types(1, 0), ['Dragon', 'Fairy', 'Ice']);
});

test('a core reports the weaknesses nobody in it covers', () => {
  const [pair] = cores([metagross, hydreigon]).cores;
  assert.deepEqual(pair.members, [0, 1]);
  assert.deepEqual(pair.holes.map(h => `${h.member} ${h.type}`).sort(), ['1 Bug', '1 Fighting']);
});

test('a complete trio sorts first', () => {
  const [best] = cores([metagross, hydreigon, talonflame]).cores;
  assert.deepEqual(best, { members: [0, 1, 2], holes: [] });
});

test('trios that improve on none of their pairs are left out', () => {
  // Abstract matrix: 0 and 1 cover each other fully; 2 covers and is covered by 0.
  const matrix = {
    members: ['a', 'b', 'c'],
    rows: [
      { type: 'Fire', multipliers: [2, 0.5, 0.5] },
      { type: 'Water', multipliers: [0.5, 2, 1] },
      { type: 'Grass', multipliers: [0.5, 1, 2] },
    ],
  };
  assert.deepEqual(defensiveCores(matrix).cores.map(c => c.members), [[0, 1], [0, 2]]);
});

test('unrelated members and empty teams give no cores', () => {
  assert.deepEqual(cores([metagross]).cores, []);
  assert.deepEqual(cores([metagross, metagross]).links, []);
  assert.deepEqual(cores([]), { weaknesses: [], links: [], cores: [] });
});
