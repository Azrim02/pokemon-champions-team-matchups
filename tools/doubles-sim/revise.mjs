// Targeted changes to the Primarina team from results/FINAL.md, on the earlier fair sets (F, H, Arch, ArchTest).
// Round 1: single changes. Round 2: combinations of the changes that helped. Results: results/revise-state.json.
import fs from 'node:fs';
import { createRequire } from 'node:module';

process.env.PREVIEW ??= 'full';
const require = createRequire(import.meta.url);
const P = require('./pool.cjs');
const here = new URL('./', import.meta.url).pathname, root = new URL('../../', import.meta.url).pathname;
const { dataset } = await import(root + 'test/helpers/dataset.js');
const { parseTeam, validateTeam, exportTeam } = await import(root + 'src/index.js');
const json = f => JSON.parse(fs.readFileSync(f));
const d = k => json(`${here}data/opp${k}.json`);
const opps = [...d('F'), ...d('H'), ...d('Arch'), ...d('ArchTest')];
const base = parseTeam(fs.readFileSync(`${here}results/FINAL.md`, 'utf8').match(/## Team 2\n\n```\n([\s\S]*?)```/)[1]);
const set = (sp, o) => t => t.map(s => (s.species === sp ? { ...s, ...o } : s));
const mv = (sp, a, b) => t => t.map(s => (s.species === sp ? { ...s, moves: s.moves.map(m => (m === a ? b : m)) } : s));
const ev = s => Object.fromEntries(['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map((k, i) => [k, +s.split('/')[i]]));
const C = {
  'Primarina Ice Beam': mv('Primarina', 'Haze', 'Ice Beam'),
  'Primarina Icy Wind': mv('Primarina', 'Haze', 'Icy Wind'),
  'Primarina Calm Mind': mv('Primarina', 'Haze', 'Calm Mind'),
  'Primarina Life Orb': set('Primarina', { item: 'Life Orb' }),
  'Primarina Sitrus': set('Primarina', { item: 'Sitrus Berry' }),
  'Primarina 22/24/4/16': set('Primarina', { evs: ev('22/0/24/4/0/16') }),
  'Rillaboom High Horsepower': mv('Rillaboom', 'U-turn', 'High Horsepower'),
  'Rillaboom HHP for Wood Hammer': mv('Rillaboom', 'Wood Hammer', 'High Horsepower'),
  'Tyranitar Focus Sash fast': set('Tyranitar', { item: 'Focus Sash', evs: ev('2/32/0/0/0/32') }),
  'Tyranitar Ice Punch': mv('Tyranitar', 'Low Kick', 'Ice Punch'),
  'Tyranitar Life Orb': set('Tyranitar', { item: 'Life Orb', evs: ev('20/32/0/0/0/14') }),
  'Garchomp Haban': set('Garchomp', { item: 'Haban Berry' }),
  'Garchomp Adamant': set('Garchomp', { nature: 'Adamant' }),
  'Garchomp Life Orb': set('Garchomp', { item: 'Life Orb' }),
  'Volcarona Charti': set('Volcarona', { item: 'Charti Berry' }),
  'Volcarona Giga Drain Modest': t => mv('Volcarona', 'Struggle Bug', 'Giga Drain')(set('Volcarona', { nature: 'Modest', evs: ev('32/0/2/32/0/0') })(t)),
  'Volcarona fast Timid': set('Volcarona', { nature: 'Timid', evs: ev('13/0/30/0/0/23') }),
  'Metagross Iron Head': mv('Metagross', 'Ice Punch', 'Iron Head'),
  'Metagross Adamant': set('Metagross', { nature: 'Adamant' }),
};
const CP = `${here}results/revise-state.json`;
const st = fs.existsSync(CP) ? json(CP) : {};
const pct = x => (100 * x).toFixed(1), mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const se = a => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1) / a.length); };
async function run(name, team, games, seed) {
  const bad = validateTeam(team, dataset); if (bad.length) { console.log('skip', name, bad.join('; ')); return; }
  const k = `${name}|${games}|${seed}`;
  if (!st[k]) { const [r] = await P.evalTeams([team], opps, games, seed); st[k] = { name, per: r.per, paste: exportTeam(team) }; fs.writeFileSync(CP, JSON.stringify(st)); }
  const b = st[`base|${games}|${seed}`].per, diff = st[k].per.map((p, i) => p - b[i]);
  console.log(`${name}: ${pct(mean(st[k].per))}  vs base ${pct(mean(diff))} ± ${pct(se(diff))}`);
  return { name, gain: mean(diff) };
}
await run('base', base, 3, 8101);
const R = []; for (const [n, f] of Object.entries(C)) { const r = await run(n, f(base), 3, 8101); if (r) R.push(r); }
R.sort((a, b) => b.gain - a.gain);
console.log('ROUND 1 DONE', R.slice(0, 6).map(r => `${r.name} ${pct(r.gain)}`).join('; '));
// Best change per Pokemon, then all combinations of the best four.
const per = {}; for (const r of R) { const sp = r.name.split(' ')[0]; if (r.gain > 0 && !per[sp]) per[sp] = r; }
const top = Object.values(per).sort((a, b) => b.gain - a.gain).slice(0, 4).map(r => r.name);
await run('base', base, 4, 9203);
for (let m = 1; m < 1 << top.length; m++) { const names = top.filter((_, i) => m >> i & 1); await run(names.join(' + '), names.reduce((t, n) => C[n](t), base), 4, 9203); }
console.log('DONE'); P.close(); process.exit(0);
