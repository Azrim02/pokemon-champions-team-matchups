import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDataset } from '../pipeline/lib/validate.js';

function dataset() {
  return {
    pokemon: [
      { id: 'garchomp', name: 'Garchomp', abilities: { 0: 'Rough Skin' }, isMega: false, battleOnly: null },
      { id: 'garchompmega', name: 'Garchomp-Mega', abilities: { 0: 'Sand Force' }, isMega: true,
        battleOnly: 'Garchomp', requiredItem: 'Garchompite' },
    ],
    items: [
      { id: 'garchompite', name: 'Garchompite', category: 'mega-stone',
        megaEvolves: [{ from: 'Garchomp', to: 'Garchomp-Mega' }] },
      { id: 'sitrusberry', name: 'Sitrus Berry', category: 'berry', megaEvolves: [] },
    ],
    moves: [{ id: 'earthquake' }, { id: 'protect' }],
    abilities: [{ name: 'Rough Skin' }, { name: 'Sand Force' }],
    learnsets: { garchomp: ['earthquake', 'protect'], garchompmega: ['earthquake'] },
  };
}

test('a consistent dataset has no errors or warnings', () => {
  assert.deepEqual(validateDataset(dataset()), { errors: [], warnings: [] });
});

test('reports duplicate ids', () => {
  const d = dataset();
  d.moves.push({ id: 'protect' });
  assert.deepEqual(validateDataset(d).errors, ['moves: duplicate id protect']);
});

test('reports unknown abilities, unknown moves and empty learnsets', () => {
  const d = dataset();
  d.pokemon[0].abilities.H = 'Sand Veil';
  d.learnsets.garchomp.push('dracometeor');
  d.learnsets.garchompmega = [];
  assert.deepEqual(validateDataset(d).errors, [
    'Garchomp: unknown ability Sand Veil',
    'Garchomp: unknown move dracometeor',
    'Garchomp-Mega: empty learnset',
  ]);
});

test('reports Megas whose stone is not legal, and stones whose Pokémon are not legal', () => {
  const d = dataset();
  d.items = d.items.filter(i => i.id !== 'garchompite');
  assert.deepEqual(validateDataset(d).errors, ['Garchomp-Mega: Mega Stone Garchompite not legal']);

  const e = dataset();
  e.pokemon = e.pokemon.filter(p => p.id !== 'garchompmega');
  assert.deepEqual(validateDataset(e).errors, ['Garchompite: Garchomp-Mega not legal']);
});

test('diffs against a reference list by id, ignoring battle-only formes', () => {
  const { errors, warnings } = validateDataset(dataset(), {
    pokemon: ['garchomp', 'Incineroar'],
    items: ['Garchompite', 'Sitrus Berry', 'Leftovers'],
  });
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, [
    'Pokémon in reference but not exported (1): Incineroar',
    'Items in reference but not exported (1): Leftovers',
  ]);
});

test('reports exported entries missing from the reference', () => {
  const { warnings } = validateDataset(dataset(), { items: ['Garchompite'] });
  assert.deepEqual(warnings, ['Items exported but not in reference (1): Sitrus Berry']);
});
