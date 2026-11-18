import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../pipeline/lib/io.js';

test('parseArgs reads --key value pairs and bare flags', () => {
  assert.deepEqual(
    parseArgs(['--month', '2026-10', '--force', '--cutoff', '1500']),
    { month: '2026-10', force: true, cutoff: '1500' },
  );
});

test('parseArgs treats a trailing flag as boolean and ignores positionals', () => {
  assert.deepEqual(parseArgs(['stray', '--top', '5', '--force']), { top: '5', force: true });
});

test('parseArgs returns an empty object for no arguments', () => {
  assert.deepEqual(parseArgs([]), {});
});
