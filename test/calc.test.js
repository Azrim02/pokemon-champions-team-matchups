import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCalcPokemon, calcSetVsSet, calcMatchup } from '../src/calc.js';
import { dataset, set } from './helpers/dataset.js';

const chomp = set('Garchomp', {
  item: 'Life Orb', ability: 'Rough Skin', nature: 'Adamant',
  evs: { hp: 2, atk: 32, spe: 32 }, moves: ['Earthquake', 'Dragon Claw', 'Protect'],
});
const roar = set('Incineroar', {
  item: 'Sitrus Berry', ability: 'Intimidate', nature: 'Careful',
  evs: { hp: 32, spd: 32 }, moves: ['Flare Blitz', 'Fake Out'],
});
const byMove = results => Object.fromEntries(results.map(r => [r.move, r]));

test('stats use the Champions Stat Point formula at level 50', () => {
  const p = toCalcPokemon(chomp, dataset);
  // HP = base + SP + 75; Atk 130 base, 32 SP, Adamant → 200 (matches the in-game stat screen).
  assert.equal(p.stats.hp, 108 + 2 + 75);
  assert.equal(p.stats.atk, 200);
  assert.equal(p.level, 50);
});

test('spread moves are reduced in Doubles (the default) but not in Singles', () => {
  const doubles = byMove(calcSetVsSet(chomp, roar, dataset)).Earthquake;
  const singles = byMove(calcSetVsSet(chomp, roar, dataset, { gameType: 'Singles' })).Earthquake;
  assert.ok(doubles.damage[1] < singles.damage[1]);
  assert.ok(Math.abs(doubles.damage[1] / singles.damage[1] - 0.75) < 0.02);
});

test('results carry damage range, percent range, rolls, KO chance and a description', () => {
  const eq = byMove(calcSetVsSet(chomp, roar, dataset)).Earthquake;
  assert.equal(eq.type, 'Ground');
  assert.equal(eq.category, 'Physical');
  assert.equal(eq.rolls.length, 16);
  assert.deepEqual(eq.damage, [Math.min(...eq.rolls), Math.max(...eq.rolls)]);
  assert.ok(eq.percent[0] > 0 && eq.percent[0] <= eq.percent[1]);
  assert.match(eq.koChance, /HKO/);
  assert.match(eq.desc, /Garchomp Earthquake vs\. .*Incineroar/);
});

test('status moves have no damage', () => {
  const protect = byMove(calcSetVsSet(chomp, roar, dataset)).Protect;
  assert.equal(protect.category, 'Status');
  assert.equal(protect.damage, null);
});

test('a Pokémon holding its Mega Stone is calc\'d as the Mega, unless mega: false', () => {
  const megaZ = set('Garchomp', { item: 'Garchompite Z', ability: 'Rough Skin', moves: ['Draco Meteor'] });
  assert.equal(toCalcPokemon(megaZ, dataset).name, 'Garchomp-Mega-Z');
  assert.equal(toCalcPokemon(megaZ, dataset).ability, 'Levitate');
  assert.equal(toCalcPokemon({ ...megaZ, state: { mega: false } }, dataset).name, 'Garchomp');
});

test('immunities do no damage (Earthquake into Levitate Mega Garchomp Z)', () => {
  const megaZ = set('Garchomp', { item: 'Garchompite Z', ability: 'Rough Skin', moves: ['Draco Meteor'] });
  const eq = byMove(calcSetVsSet(chomp, megaZ, dataset)).Earthquake;
  assert.deepEqual(eq.damage, [0, 0]);
  assert.equal(eq.koChance, 'no damage');
});

test('mySide / oppSide swap when the opponent is attacking', () => {
  const plain = byMove(calcSetVsSet(roar, chomp, dataset, {}, { reverse: true }))['Flare Blitz'];
  const reflect = byMove(calcSetVsSet(roar, chomp, dataset, { mySide: { isReflect: true } }, { reverse: true }))['Flare Blitz'];
  assert.ok(reflect.damage[1] < plain.damage[1], 'my Reflect should cut the opponent\'s physical damage');
});

test('battle state on the set (boosts, HP) is applied', () => {
  const boosted = byMove(calcSetVsSet({ ...chomp, state: { boosts: { atk: 2 } } }, roar, dataset)).Earthquake;
  const plain = byMove(calcSetVsSet(chomp, roar, dataset)).Earthquake;
  assert.ok(boosted.damage[1] > plain.damage[1] * 1.9);
  const hurt = toCalcPokemon({ ...roar, state: { curHPPct: 50 } }, dataset);
  assert.equal(hurt.curHP(), Math.round(hurt.maxHP() / 2));
});

test('calcMatchup returns every pairing with moves in both directions', () => {
  const mine = [chomp, roar];
  const theirs = [set('Sneasler', { ability: 'Unburden', nature: 'Jolly', moves: ['Close Combat', 'Dire Claw'] })];
  const out = calcMatchup(mine, theirs, dataset);
  assert.equal(out.length, 2);
  assert.deepEqual(out.map(p => [p.mine, p.theirs]), [['Garchomp', 'Sneasler'], ['Incineroar', 'Sneasler']]);
  assert.deepEqual(out[0].myMoves.map(r => r.move), ['Earthquake', 'Dragon Claw', 'Protect']);
  assert.deepEqual(out[0].theirMoves.map(r => r.move), ['Close Combat', 'Dire Claw']);
});

test('Aegislash resolves to the calc\'s Aegislash-Shield', () => {
  const aegi = set('Aegislash', { ability: 'Stance Change', moves: ['Shadow Ball'] });
  assert.equal(toCalcPokemon(aegi, dataset).name, 'Aegislash-Shield');
});

const basc = set('Basculegion', {
  item: 'Mystic Water', ability: 'Adaptability', nature: 'Adamant',
  evs: { hp: 2, atk: 32, spe: 32 }, moves: ['Last Respects', 'Wave Crash'],
});

test('Last Respects gains 50 base power per fainted ally, from the attacker side', () => {
  const at = n => byMove(calcSetVsSet(basc, chomp, dataset, { mySide: { alliesFainted: n } }))['Last Respects'];
  assert.equal(at(0).basePower, 50);
  assert.equal(at(2).basePower, 150);
  assert.ok(at(2).damage[1] > at(1).damage[1] && at(1).damage[1] > at(0).damage[1]);
  // The opponent's faints don't power up my Last Respects.
  const theirs = byMove(calcSetVsSet(basc, chomp, dataset, { oppSide: { alliesFainted: 3 } }))['Last Respects'];
  assert.equal(theirs.basePower, 50);
  // set.state overrides the side.
  const own = byMove(calcSetVsSet({ ...basc, state: { alliesFainted: 3 } }, chomp, dataset))['Last Respects'];
  assert.equal(own.basePower, 200);
});

test('Last Respects lists its damage at 0 to 3 fainted allies; other moves do not', () => {
  const res = byMove(calcSetVsSet(basc, chomp, dataset, { mySide: { alliesFainted: 1 } }));
  const lr = res['Last Respects'];
  assert.equal(lr.alliesFainted, 1);
  assert.deepEqual(lr.byFaints.map(b => b.alliesFainted), [0, 1, 2, 3]);
  assert.deepEqual(lr.byFaints[1].percent, lr.percent);
  assert.ok(lr.byFaints[3].percent[0] > lr.byFaints[0].percent[1]);
  assert.equal(res['Wave Crash'].byFaints, undefined);
});
