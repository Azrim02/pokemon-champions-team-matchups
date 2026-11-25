// Adds sample wins for one gauntlet team to results/gauntlet-state.json, for guide.mjs.
// Usage: node sample.mjs <gauntlet file name>
import fs from 'node:fs';
import { createRequire } from 'node:module';

process.env.PREVIEW ??= 'full';
const P = createRequire(import.meta.url)('./pool.cjs');
const here = new URL('./', import.meta.url).pathname;
const { parseTeam } = await import(new URL('../../src/index.js', import.meta.url).href);
const team = parseTeam(fs.readFileSync(`${here}gauntlet/${process.argv[2]}`, 'utf8'));
const opps = JSON.parse(fs.readFileSync(`${here}data/oppArchNew.json`));
const [r] = await P.evalTeams([team], opps, 1, 4242, true);
const f = `${here}results/gauntlet-state.json`, st = JSON.parse(fs.readFileSync(f));
st[`Fresh archetypes | ${JSON.stringify(team)}`].sample = r.sample;
fs.writeFileSync(f, JSON.stringify(st));
console.log('samples', r.sample.filter(Boolean).length); P.close(); process.exit(0);
