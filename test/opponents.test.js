import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSpread, likelySets, likelyTeam, topThreats } from '../src/opponents.js';
import { validateTeam } from '../src/team.js';
import { dataset } from './helpers/dataset.js';

// Same shape as data/usage/<month>/<format>-<cutoff>.json.
const usage = {
  pokemon: [
    {
      id: 'charizardmegay', name: 'Charizard-Mega-Y', usagePct: 32.35,
      abilities: [{ id: 'drought', pct: 100 }],
      items: [{ id: 'charizarditey', pct: 100 }],
      moves: [
        { id: 'heatwave', pct: 99 }, { id: '', pct: 50 }, { id: 'weatherball', pct: 80 },
        { id: 'protect', pct: 70 }, { id: 'solarbeam', pct: 40 }, { id: 'ancientpower', pct: 30 },
      ],
      spreads: [{ spread: 'Modest:2/0/0/32/0/32', pct: 40 }, { spread: 'Timid:2/0/0/32/0/32', pct: 30 }],
    },
    {
      id: 'kingambit', name: 'Kingambit', usagePct: 42.25,
      abilities: [{ id: 'defiant', pct: 90 }, { id: 'supremeoverlord', pct: 10 }],
      items: [{ id: 'nothing', pct: 60 }, { id: 'chopleberry', pct: 40 }],
      moves: [{ id: 'kowtowcleave', pct: 99 }, { id: 'suckerpunch', pct: 98 }],
      spreads: [],
    },
    { id: 'notapokemon', name: 'Not A Pokemon', usagePct: 1, abilities: [], items: [], moves: [], spreads: [] },
  ],
};

test('parseSpread splits nature and Stat Points', () => {
  assert.deepEqual(parseSpread('Adamant:2/32/0/0/0/32'), {
    nature: 'Adamant', evs: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
  });
});

test('likelySets registers a Mega seen in usage as its base forme holding the stone', () => {
  const [s] = likelySets(usage.pokemon[0], dataset);
  assert.equal(s.species, 'Charizard');
  assert.equal(s.item, 'Charizardite Y');
  assert.equal(s.usage.seenAs, 'Charizard-Mega-Y');
  // Drought belongs to the Mega, so the base forme falls back to one of its own abilities.
  assert.ok(Object.values(dataset.getPokemon('Charizard').abilities).includes(s.ability));
  assert.deepEqual(validateTeam([s], dataset), []);
  // …but the ability it battles with is still reported, for display.
  assert.equal(s.usage.battleAbility, 'Drought');
  assert.equal(s.usage.battleAbilityPct, 100);
});

test('likelySets reports the battle ability as the registered one for a non-Mega', () => {
  const [s] = likelySets(usage.pokemon[1], dataset);
  assert.equal(s.usage.battleAbility, 'Defiant');
  assert.equal(s.usage.battleAbilityPct, 90);
});

test('likelySets picks the top four real moves, skipping empty slots', () => {
  const [s] = likelySets(usage.pokemon[0], dataset);
  assert.deepEqual(s.moves, ['Heat Wave', 'Weather Ball', 'Protect', 'Solar Beam']);
  assert.deepEqual(s.usage.movePcts, [99, 80, 70, 40]);
});

test('likelySets returns one set per requested spread', () => {
  const sets = likelySets(usage.pokemon[0], dataset, { spreads: 2 });
  assert.deepEqual(sets.map(s => s.nature), ['Modest', 'Timid']);
  assert.deepEqual(sets.map(s => s.usage.spreadPct), [40, 30]);
});

test('likelySets skips "nothing" as an item and handles missing spreads', () => {
  const [s] = likelySets(usage.pokemon[1], dataset);
  assert.equal(s.item, 'Chople Berry');
  assert.equal(s.ability, 'Defiant');
  assert.equal(s.nature, 'Serious');
  assert.equal(s.usage.spreadPct, null);
});

test('likelySets returns nothing for a Pokémon not in the dataset', () => {
  assert.deepEqual(likelySets(usage.pokemon[2], dataset), []);
});

test('likelyTeam looks up team-preview Pokémon by name, including ones missing from usage', () => {
  const team = likelyTeam(['Kingambit', 'Garchomp'], usage, dataset);
  assert.deepEqual(team.map(t => [t.species, t.sets.length]), [['Kingambit', 1], ['Garchomp', 0]]);
});

test('topThreats keeps usage order and drops unknown Pokémon', () => {
  assert.deepEqual(topThreats(usage, dataset, { n: 3 }).map(t => t.species), ['Charizard-Mega-Y', 'Kingambit']);
});
