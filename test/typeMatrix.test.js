import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectiveness, defensiveProfile, teamDefense, teamCoverage } from '../src/typeMatrix.js';
import { dataset, set } from './helpers/dataset.js';

const tc = dataset.typechart;

test('effectiveness multiplies across both defending types', () => {
  assert.equal(effectiveness('Ice', ['Dragon', 'Ground'], tc), 4);
  assert.equal(effectiveness('Ground', ['Fire', 'Flying'], tc), 0);
  assert.equal(effectiveness('Fire', ['Water', 'Dragon'], tc), 0.25);
});

test('defensiveProfile applies ability type modifiers', () => {
  assert.equal(defensiveProfile(['Electric', 'Water'], tc).Ground, 2);
  assert.equal(defensiveProfile(['Electric', 'Water'], tc, 'Levitate').Ground, 0);
  assert.equal(defensiveProfile(['Fire', 'Dark'], tc, 'Thick Fat').Ice, 0.25);
  assert.equal(Object.keys(defensiveProfile(['Normal'], tc)).length, 18);
});

test('Eelevate makes Mega Eelektross immune to Ground', () => {
  assert.equal(defensiveProfile(['Electric'], tc, 'Eelevate').Ground, 0);
  const { members, rows } = teamDefense([set('Eelektross', { item: 'Eelektrossite', ability: 'Levitate' })], dataset);
  assert.deepEqual(members, ['Eelektross-Mega']);
  assert.deepEqual(rows.find(r => r.type === 'Ground').multipliers, [0]);
});

test('teamDefense counts weaknesses, resistances and immunities, using Mega formes', () => {
  const team = [
    set('Garchomp', { ability: 'Rough Skin' }),
    set('Charizard', { item: 'Charizardite X', ability: 'Blaze' }), // Mega X: Fire/Dragon
  ];
  const { members, rows } = teamDefense(team, dataset);
  assert.deepEqual(members, ['Garchomp', 'Charizard-Mega-X']);
  const row = type => rows.find(r => r.type === type);
  assert.deepEqual(row('Dragon').multipliers, [2, 2]);
  assert.equal(row('Dragon').weak, 2);
  assert.deepEqual(row('Electric').multipliers, [0, 0.5]);
  assert.equal(row('Electric').immune, 1);
  assert.equal(row('Electric').resist, 1);
  assert.deepEqual(row('Ice').multipliers, [4, 1]);
});

test('teamCoverage finds each attacker\'s best damaging move against each opponent', () => {
  const mine = [set('Garchomp', { ability: 'Rough Skin', moves: ['Earthquake', 'Dragon Claw', 'Swords Dance'] })];
  const theirs = [set('Incineroar', { ability: 'Intimidate' }), set('Dragonite', { ability: 'Multiscale' })];
  assert.deepEqual(teamCoverage(mine, theirs, dataset), [
    { attacker: 'Garchomp', defender: 'Incineroar', best: 2, move: 'Earthquake' },
    { attacker: 'Garchomp', defender: 'Dragonite', best: 2, move: 'Dragon Claw' },
  ]);
});

test('teamCoverage reports null for a Pokémon with no damaging moves', () => {
  const [row] = teamCoverage([set('Whimsicott', { moves: ['Tailwind'] })], [set('Garchomp')], dataset);
  assert.equal(row.best, null);
  assert.equal(row.move, null);
});
