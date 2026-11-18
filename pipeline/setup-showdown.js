// Fetches Pokémon Showdown at the pinned commit into vendor/ and builds it.
// The npm release lags behind (0.11.11 still ships M-B as `champions`), so we build from git.
// Usage: npm run setup:showdown [-- --force]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { SHOWDOWN } from './config.js';
import { parseArgs } from './lib/io.js';

const args = parseArgs();
const marker = path.join(SHOWDOWN.dir, '.pinned-commit');
const run = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, { cwd: SHOWDOWN.dir, stdio: 'inherit' });

const current = fs.existsSync(marker) ? fs.readFileSync(marker, 'utf8').trim() : null;
if (current === SHOWDOWN.commit && !args.force) {
  console.log(`Showdown already set up at ${SHOWDOWN.commit.slice(0, 10)}, skipping (--force to rebuild).`);
  process.exit(0);
}

fs.rmSync(SHOWDOWN.dir, { recursive: true, force: true });
fs.mkdirSync(SHOWDOWN.dir, { recursive: true });

console.log(`Fetching Showdown ${SHOWDOWN.commit.slice(0, 10)}…`);
run('git', ['init', '-q']);
run('git', ['remote', 'add', 'origin', SHOWDOWN.repo]);
run('git', ['fetch', '-q', '--depth', '1', 'origin', SHOWDOWN.commit]);
run('git', ['checkout', '-q', 'FETCH_HEAD']);

console.log('Installing dependencies and building…');
run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error']);
run('node', ['build']);

fs.writeFileSync(marker, SHOWDOWN.commit + '\n');
console.log('Showdown ready.');
