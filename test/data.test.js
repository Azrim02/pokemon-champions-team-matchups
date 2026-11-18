// Regression tests on the committed export in data/. They need no Showdown build, and they
// catch legality mistakes that internal consistency checks can't see.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { PATHS } from '../pipeline/config.js';
import { readJson } from '../pipeline/lib/io.js';
import { validateDataset } from '../pipeline/lib/validate.js';

const load = f => readJson(path.join(PATHS.data, f));
const pokemon = load('pokemon.json');
const items = load('items.json');
const moves = load('moves.json');
const abilities = load('abilities.json');
const learnsets = load('learnsets.json');
const typechart = load('typechart.json');
const meta = load('meta.json');

const pokemonById = new Map(pokemon.map(p => [p.id, p]));
const itemIds = new Set(items.map(i => i.id));

test('the export passes all consistency checks', () => {
  assert.deepEqual(validateDataset({ pokemon, items, moves, abilities, learnsets }).errors, []);
});

test('meta counts match the files', () => {
  assert.equal(meta.counts.pokemon, pokemon.length);
  assert.equal(meta.counts.items, items.length);
  assert.equal(meta.counts.moves, moves.length);
  assert.equal(meta.counts.abilities, abilities.length);
  assert.equal(meta.counts.megas, pokemon.filter(p => p.isMega).length);
});

test('meta has no timestamp, so re-running the export gives no diff', () => {
  assert.equal(meta.generatedAt, undefined);
});

test('the export targets Regulation M-C', () => {
  assert.equal(meta.regulation.id, 'M-C');
  assert.ok(meta.ruleset.includes('Flat Rules'));
});

test('M-C staples are legal', () => {
  for (const id of ['incineroar', 'sneasler', 'kingambit', 'garchomp', 'charizardmegay', 'palafinhero']) {
    assert.ok(pokemonById.has(id), `${id} should be legal`);
  }
});

test('Mythicals, Restricted Legendaries and removed Pokémon are not legal', () => {
  for (const id of ['mew', 'koraidon', 'bulbasaur']) assert.ok(!pokemonById.has(id), `${id} should not be legal`);
});

test('battle forms of Pokémon that are not legal are excluded', () => {
  for (const id of ['ogerponwellspringtera', 'cramorantgulping', 'eiscuenoice', 'miniormeteor']) {
    assert.ok(!pokemonById.has(id), `${id} should not be legal`);
  }
});

test('cosmetic formes are folded into their base species', () => {
  assert.ok(!pokemonById.has('vivillonpolar'));
  assert.ok(pokemonById.get('vivillon').cosmeticFormes.includes('Vivillon-Polar'));
});

test('M-C additions are present: Mega Z forms and their stones', () => {
  for (const [mon, stone] of [['garchompmegaz', 'garchompitez'], ['absolmegaz', 'absolitez']]) {
    const p = pokemonById.get(mon);
    assert.ok(p?.isMega, `${mon} should be a legal Mega`);
    assert.ok(itemIds.has(stone), `${stone} should be legal`);
  }
});

test('Megas point back to their base forme and Mega Stone', () => {
  const mega = pokemonById.get('charizardmegay');
  assert.equal(mega.battleOnly, 'Charizard');
  assert.equal(mega.requiredItem, 'Charizardite Y');
  const stone = items.find(i => i.name === 'Charizardite Y');
  assert.deepEqual(stone.megaEvolves, [{ from: 'Charizard', to: 'Charizard-Mega-Y' }]);
});

test('items are categorised', () => {
  const cat = id => items.find(i => i.id === id)?.category;
  assert.equal(cat('leftovers'), 'held');
  assert.equal(cat('sitrusberry'), 'berry');
  assert.equal(cat('garchompite'), 'mega-stone');
});

test('the type chart has the 18 types, no Stellar, and correct matchups', () => {
  assert.equal(Object.keys(typechart).length, 18);
  assert.ok(!('Stellar' in typechart));
  for (const row of Object.values(typechart)) assert.equal(Object.keys(row).length, 18);
  assert.equal(typechart.Ground.Flying, 0);
  assert.equal(typechart.Fire.Grass, 2);
  assert.equal(typechart.Water.Grass, 0.5);
  assert.equal(typechart.Dragon.Fairy, 0);
  assert.equal(typechart.Normal.Normal, 1);
});

test('every learnset is keyed by an exported Pokémon', () => {
  assert.deepEqual(Object.keys(learnsets).sort(), pokemon.map(p => p.id).sort());
});
