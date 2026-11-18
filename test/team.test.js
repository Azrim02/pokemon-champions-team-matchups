import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTeam, exportTeam, validateTeam } from '../src/team.js';
import { dataset, set } from './helpers/dataset.js';

const paste = `
=== [gen9championsvgc2026regmc] Sample ===

Chomp (Garchomp) (F) @ Garchompite Z
Ability: Rough Skin
Level: 50
EVs: 2 HP / 32 SpA / 32 Spe
Timid Nature
IVs: 0 Atk
- Draco Meteor
- Earth Power
- Protect
- Flamethrower

Incineroar @ Sitrus Berry
Ability: Intimidate
SPs: 32 HP / 2 Def / 32 SpD
Careful Nature
- Fake Out
- Flare Blitz
- Parting Shot
- Darkest Lariat
`;

test('parseTeam reads nickname, species, gender, item, ability, nature and moves', () => {
  const [chomp, roar] = parseTeam(paste);
  assert.equal(chomp.name, 'Chomp');
  assert.equal(chomp.species, 'Garchomp');
  assert.equal(chomp.gender, 'F');
  assert.equal(chomp.item, 'Garchompite Z');
  assert.equal(chomp.ability, 'Rough Skin');
  assert.equal(chomp.nature, 'Timid');
  assert.deepEqual(chomp.moves, ['Draco Meteor', 'Earth Power', 'Protect', 'Flamethrower']);
  assert.equal(roar.name, '');
  assert.equal(roar.species, 'Incineroar');
});

test('parseTeam reads Stat Points from both "EVs:" and "SPs:" lines', () => {
  const [chomp, roar] = parseTeam(paste);
  assert.deepEqual(chomp.evs, { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 });
  assert.deepEqual(roar.evs, { hp: 32, atk: 0, def: 2, spa: 0, spd: 32, spe: 0 });
});

test('parseTeam handles Windows line endings and a set without an item', () => {
  const [s] = parseTeam('Whimsicott\r\nAbility: Prankster\r\n- Tailwind\r\n');
  assert.equal(s.species, 'Whimsicott');
  assert.equal(s.item, '');
  assert.deepEqual(s.moves, ['Tailwind']);
});

test('exportTeam round-trips through parseTeam', () => {
  const sets = parseTeam(paste);
  assert.deepEqual(parseTeam(exportTeam(sets)), sets);
});

test('exportTeam writes Stat Points on the EVs line, like Showdown', () => {
  const out = exportTeam(parseTeam(paste).slice(0, 1));
  assert.match(out, /^Chomp \(Garchomp\) \(F\) @ Garchompite Z\n/);
  assert.match(out, /\nEVs: 2 HP \/ 32 SpA \/ 32 Spe\n/);
});

test('a legal team has no problems', () => {
  assert.deepEqual(validateTeam(parseTeam(paste), dataset), []);
});

test('validateTeam flags illegal Pokémon, items, abilities and moves', () => {
  const problems = validateTeam([
    set('Mew', { ability: 'Synchronize', moves: ['Psychic'] }),
    set('Garchomp', { item: 'Choice Band', ability: 'Levitate', moves: ['Earthquake', 'Knock Off', 'Not A Move'] }),
    set('Incineroar', { ability: 'Intimidate', moves: ['Knock Off'] }),
  ], dataset);
  assert.deepEqual(problems, [
    'Mew: Mew is not legal in this regulation',
    'Garchomp: item Choice Band is not legal',
    "Garchomp: Garchomp can't have Levitate",
    "Garchomp: Garchomp can't learn Knock Off",
    'Garchomp: move Not A Move is not legal',
    "Incineroar: Incineroar can't learn Knock Off",
  ]);
});

test('validateTeam enforces the Stat Point limits (32 per stat, 66 total)', () => {
  const problems = validateTeam([
    set('Garchomp', { ability: 'Rough Skin', moves: ['Earthquake'], evs: { atk: 33, spe: 32, hp: 2 } }),
  ], dataset);
  assert.deepEqual(problems, [
    'Garchomp: 33 Stat Points in Atk (max 32)',
    'Garchomp: 67 Stat Points in total (max 66)',
  ]);
});

test('validateTeam enforces Species Clause across formes, and Item Clause', () => {
  const problems = validateTeam([
    set('Rotom-Wash', { ability: 'Levitate', item: 'Sitrus Berry', moves: ['Hydro Pump'] }),
    set('Rotom', { ability: 'Levitate', item: 'Sitrus Berry', moves: ['Thunderbolt'] }),
  ], dataset);
  assert.deepEqual(problems, [
    'Species Clause: Rotom-Wash and Rotom share species Rotom',
    'Item Clause: Rotom-Wash and Rotom share item Sitrus Berry',
  ]);
});

test('validateTeam rejects registering a battle-only forme', () => {
  const problems = validateTeam([set('Charizard-Mega-Y', { ability: 'Drought', moves: ['Heat Wave'] })], dataset);
  assert.deepEqual(problems, ['Charizard-Mega-Y: Charizard-Mega-Y is a battle-only forme; register Charizard']);
});

test('validateTeam flags move count problems and oversized teams', () => {
  const g = set('Garchomp', { ability: 'Rough Skin', moves: ['Earthquake', 'Earthquake'] });
  assert.ok(validateTeam([g], dataset).includes('Garchomp: duplicate moves'));
  const five = set('Garchomp', { ability: 'Rough Skin', moves: ['Earthquake', 'Protect', 'Dragon Claw', 'Rock Slide', 'Swords Dance'] });
  assert.ok(validateTeam([five], dataset).includes('Garchomp: more than 4 moves'));
  assert.ok(validateTeam(Array(7).fill(null).map(() => set('Garchomp', { ability: 'Rough Skin', moves: ['Protect'] })), dataset)
    .includes('Team has 7 Pokémon (max 6)'));
});
