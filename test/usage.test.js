import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toId, checkStats, summarizeUsage, previousMonth } from '../pipeline/lib/usage.js';

// Trimmed-down shape of a Smogon chaos file.
const raw = {
  info: { metagame: 'gen9championsvgc2026regmc', cutoff: 1760, 'number of battles': 10 },
  data: {
    'Sirfetch’d': {
      'Raw count': 4,
      usage: 0.1,
      Abilities: { scrappy: 1, steadfast: 3 },
      Items: { leek: 4 },
      Moves: { closecombat: 4, protect: 2, '': 1 },
      Spreads: { 'Adamant:2/32/0/0/0/32': 4 },
      Teammates: { Kingambit: 1, 'Charizard-Mega-Y': 3 },
      'Checks and Counters': {},
    },
    Kingambit: {
      'Raw count': 20,
      usage: 0.4225,
      Abilities: { defiant: 20 },
      Items: { chopleberry: 9, blackglasses: 11 },
      Moves: { suckerpunch: 20 },
      Spreads: {},
      Teammates: {},
      'Checks and Counters': {
        Rillaboom: { n: 20.5, p: 0.43, d: 0.11 },
        'Iron Hands': [10, 0.6, 0.05],
      },
    },
  },
};

test('toId strips punctuation, spaces and curly apostrophes', () => {
  assert.equal(toId('Sirfetch’d'), 'sirfetchd');
  assert.equal(toId("Sirfetch'd"), 'sirfetchd');
  assert.equal(toId('Charizard-Mega-Y'), 'charizardmegay');
  assert.equal(toId('Mr. Rime'), 'mrrime');
});

test('checkStats reads both the array and object checks formats', () => {
  assert.deepEqual(checkStats([10, 0.6, 0.05]), { score: 60, sd: 5, n: 10 });
  assert.deepEqual(checkStats({ n: 20.555, p: 0.4307, d: 0.1092 }), { score: 43.07, sd: 10.92, n: 20.56 });
});

test('summarizeUsage sorts by usage and keys species by id', () => {
  const [first, second] = summarizeUsage(raw);
  assert.equal(first.id, 'kingambit');
  assert.equal(first.usagePct, 42.25);
  assert.equal(second.id, 'sirfetchd');
  assert.equal(second.name, 'Sirfetch’d');
  assert.deepEqual(second.teammates, ['charizardmegay', 'kingambit']);
});

test('summarizeUsage turns weighted counts into percentages of the mon\'s total weight', () => {
  const sirfetchd = summarizeUsage(raw).find(p => p.id === 'sirfetchd');
  assert.deepEqual(sirfetchd.abilities, [{ id: 'steadfast', pct: 75 }, { id: 'scrappy', pct: 25 }]);
  assert.deepEqual(sirfetchd.items, [{ id: 'leek', pct: 100 }]);
  assert.deepEqual(sirfetchd.moves[0], { id: 'closecombat', pct: 100 });
  assert.deepEqual(sirfetchd.spreads, [{ spread: 'Adamant:2/32/0/0/0/32', pct: 100 }]);
});

test('summarizeUsage ranks checks and counters by score', () => {
  const kingambit = summarizeUsage(raw).find(p => p.id === 'kingambit');
  assert.deepEqual(kingambit.checksAndCounters.map(c => c.id), ['ironhands', 'rillaboom']);
});

test('summarizeUsage respects topN', () => {
  const kingambit = summarizeUsage(raw, { topN: 1 }).find(p => p.id === 'kingambit');
  assert.deepEqual(kingambit.items, [{ id: 'blackglasses', pct: 55 }]);
  assert.equal(kingambit.checksAndCounters.length, 1);
});

test('previousMonth handles the year boundary', () => {
  assert.equal(previousMonth(new Date(Date.UTC(2026, 10, 18))), '2026-10');
  assert.equal(previousMonth(new Date(Date.UTC(2027, 0, 31))), '2026-12');
  assert.equal(previousMonth(new Date(Date.UTC(2026, 2, 31))), '2026-02');
});
