import { test } from 'node:test';
import assert from 'node:assert/strict';
import { battleAbility, setterWeather, pairingWeather } from '../src/weather.js';
import { calcSetVsSet } from '../src/calc.js';
import { dataset, set } from './helpers/dataset.js';

const zardY = set('Charizard', {
  item: 'Charizardite Y', ability: 'Blaze', nature: 'Modest',
  evs: { spa: 32, spe: 32 }, moves: ['Heat Wave', 'Weather Ball'],
});
const pelipper = set('Pelipper', { item: 'Damp Rock', ability: 'Drizzle', nature: 'Bold', evs: { hp: 32 }, moves: ['Hurricane'] });
const politoed = set('Politoed', { ability: 'Drizzle', nature: 'Calm', evs: { hp: 32 }, moves: ['Weather Ball'] });
const ttar = set('Tyranitar', { ability: 'Sand Stream', nature: 'Jolly', evs: { spe: 32 }, moves: ['Rock Slide'] });
const metagross = set('Metagross', {
  item: 'Metagrossite', ability: 'Clear Body', nature: 'Jolly', evs: { atk: 32, spe: 32 }, moves: ['Iron Head'],
});

test('battleAbility is the Mega forme\'s ability when holding the stone', () => {
  assert.equal(battleAbility(zardY, dataset), 'Drought');
  assert.equal(battleAbility({ ...zardY, state: { mega: false } }, dataset), 'Blaze');
  assert.equal(battleAbility(pelipper, dataset), 'Drizzle');
});

test('setterWeather maps weather abilities, including Megas, and nothing else', () => {
  assert.equal(setterWeather(zardY, dataset), 'Sun');
  assert.equal(setterWeather(pelipper, dataset), 'Rain');
  assert.equal(setterWeather(ttar, dataset), 'Sand');
  assert.equal(setterWeather(metagross, dataset), null);
});

test('pairingWeather: no setter keeps the fallback, one setter wins over it', () => {
  assert.equal(pairingWeather(metagross, metagross, dataset, 'Snow'), 'Snow');
  assert.equal(pairingWeather(metagross, metagross, dataset), null);
  assert.equal(pairingWeather(metagross, zardY, dataset, 'Rain'), 'Sun');
  assert.equal(pairingWeather(pelipper, metagross, dataset), 'Rain');
});

test('pairingWeather: a Mega setter activates after switch-in abilities and wins', () => {
  assert.equal(pairingWeather(pelipper, zardY, dataset), 'Sun');
  assert.equal(pairingWeather(zardY, pelipper, dataset), 'Sun');
});

test('pairingWeather: between two regular setters the slower one activates last', () => {
  // Pelipper (base 65 Spe, no SP) is slower than Jolly 32-SP Tyranitar (base 61).
  assert.equal(pairingWeather(pelipper, ttar, dataset), 'Rain');
  assert.equal(pairingWeather(ttar, pelipper, dataset), 'Rain');
  // Same setter type: same weather either way.
  assert.equal(pairingWeather(pelipper, politoed, dataset), 'Rain');
});

test('the weather changes the calc the way the dashboard uses it', () => {
  const heatWave = w => calcSetVsSet(zardY, metagross, dataset, { weather: w }).find(r => r.move === 'Heat Wave');
  const w = pairingWeather(zardY, metagross, dataset);
  assert.ok(heatWave(w).damage[1] > heatWave(undefined).damage[1]);
});
