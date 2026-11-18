// @smogon/calc ships its own copy of the Champions data. These tests make sure it agrees with
// our Showdown export, so a calc'd Pokémon is the same Pokémon the rest of the app shows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gen, CALC_SPECIES_ALIASES } from '../src/calc.js';
import { toId } from '../src/data.js';
import { dataset } from './helpers/dataset.js';

const { pokemon, items, moves } = dataset.raw;

test('every exported Pokémon exists in the calc with the same types and base stats', () => {
  const diffs = [];
  for (const p of pokemon) {
    const c = gen.species.get(toId(CALC_SPECIES_ALIASES[p.name] ?? p.id));
    if (!c) { diffs.push(`${p.name}: missing from calc`); continue; }
    if (c.types.join('/') !== p.types.join('/')) diffs.push(`${p.name}: types ${c.types} vs ${p.types}`);
    for (const [stat, v] of Object.entries(p.baseStats)) {
      if (c.baseStats[stat] !== v) diffs.push(`${p.name}: ${stat} ${c.baseStats[stat]} vs ${v}`);
    }
  }
  assert.deepEqual(diffs, []);
});

test('every exported item exists in the calc', () => {
  assert.deepEqual(items.filter(i => !gen.items.get(i.id)).map(i => i.name), []);
});

test('every damaging move has the same type, category and power in the calc', () => {
  const diffs = [];
  for (const m of moves.filter(m => m.category !== 'Status')) {
    const c = gen.moves.get(m.id);
    if (!c) { diffs.push(`${m.name}: missing from calc`); continue; }
    const theirs = `${c.type}/${c.category}/${c.basePower ?? 0}`;
    const ours = `${m.type}/${m.category}/${m.basePower}`;
    if (theirs !== ours) diffs.push(`${m.name}: ${theirs} vs ${ours}`);
  }
  assert.deepEqual(diffs, []);
});
