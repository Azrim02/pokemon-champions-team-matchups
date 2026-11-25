// Gauntlet: every paste in gauntlet/*.txt plays the same opponents with the same seeds.
// Fresh sets (I, ArchNew) were used by no other script; the earlier sets are listed separately because some
// teams were selected on F and Arch. Writes results/GAUNTLET.md. First file alphabetically is the reference.
import fs from 'node:fs';
import { createRequire } from 'node:module';

process.env.PREVIEW ??= 'full';
const require = createRequire(import.meta.url);
const P = require('./pool.cjs');
const here = new URL('./', import.meta.url).pathname, root = new URL('../../', import.meta.url).pathname;
const { dataset } = await import(root + 'test/helpers/dataset.js');
const { parseTeam, validateTeam, teamDefense } = await import(root + 'src/index.js');
const json = f => JSON.parse(fs.readFileSync(f));
const d = k => json(`${here}data/opp${k}.json`);
const files = fs.readdirSync(`${here}gauntlet`).filter(f => f.endsWith('.txt')).sort();
const teams = files.map(f => {
  const t = parseTeam(fs.readFileSync(`${here}gauntlet/${f}`, 'utf8'));
  const bad = validateTeam(t, dataset); if (bad.length) throw new Error(`${f}: ${bad.join('; ')}`);
  return t;
});
const groups = [
  { name: 'Fresh usage', opps: d('I'), games: 8 }, { name: 'Fresh archetypes', opps: d('ArchNew'), games: 8, names: json(`${here}data/oppArchNew-names.json`) },
  { name: 'Earlier usage (F, H)', opps: [...d('F'), ...d('H')], games: 3 }, { name: 'Earlier archetypes', opps: [...d('Arch'), ...d('ArchTest')], games: 3 },
];
const CP = `${here}results/gauntlet-state.json`;
const st = fs.existsSync(CP) ? json(CP) : {};
const t0 = Date.now(); let done = 0;
for (const [gi, g] of groups.entries()) for (let i = 0; i < teams.length; i++) {
  const key = g.name + ' | ' + JSON.stringify(teams[i]);
  if (!st[key]) { const [r] = await P.evalTeams([teams[i]], g.opps, g.games, 7001 + gi * 997, true); st[key] = { per: r.per, bring: r.bring, n: r.n, w: r.w, mv: r.mv, st: r.st, lead: r.lead, four: r.four, t1: r.t1, oppLead: r.oppLead, ...(i === 0 && gi < 2 ? { sample: r.sample } : {}) }; fs.writeFileSync(CP, JSON.stringify(st)); }
  done++;
  const x = st[key];
  fs.writeFileSync(`${here}results/gauntlet-progress.json`, JSON.stringify({ stage: g.name, done, total: teams.length * groups.length, team: files[i], p: x.w / x.n, secondsThisRun: Math.round((Date.now() - t0) / 1000), at: new Date().toISOString() }));
  console.log(g.name, files[i], (100 * x.w / x.n).toFixed(1));
}
const pct = x => (100 * x).toFixed(1), mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const se = a => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1) / a.length); };
const at = (g, i) => st[g.name + ' | ' + JSON.stringify(teams[i])];
const label = f => f.replace(/^\d+-|\.txt$/g, '');
let md = `# Gauntlet\n\nWritten ${new Date().toISOString()} by \`gauntlet.mjs\`. Every team plays the same opponents with the same seeds. ± is the standard error across opponents; differences are paired by opponent.\n\n## Win rates\n\n| Team | ${groups.map(g => `${g.name} (${g.opps.length} × ${g.games})`).join(' | ')} |\n|---|${groups.map(() => '---').join('|')}|\n`;
files.forEach((f, i) => { md += `| ${label(f)} | ${groups.map(g => `${pct(mean(at(g, i).per))} ± ${pct(se(at(g, i).per))}`).join(' | ')} |\n`; });
md += `\n## ${label(files[0])} minus each team\n\n| Team | Fresh, usage + archetypes | Fresh usage | Fresh archetypes |\n|---|---|---|---|\n`;
const both = i => [...at(groups[0], i).per, ...at(groups[1], i).per];
const df = (a, b) => { const x = a.map((p, k) => p - b[k]); return `${mean(x) >= 0 ? '+' : ''}${pct(mean(x))} ± ${pct(se(x))}`; };
files.forEach((f, i) => { if (i) md += `| ${label(f)} | ${df(both(0), both(i))} | ${df(at(groups[0], 0).per, at(groups[0], i).per)} | ${df(at(groups[1], 0).per, at(groups[1], i).per)} |\n`; });
const kinds = [...new Set(groups[1].names)];
md += `\n## Fresh archetypes\n\n| Archetype | ${files.map(label).join(' | ')} |\n|---|${files.map(() => '---').join('|')}|\n` + kinds.map(k => `| ${k} | ${files.map((_, i) => pct(mean(at(groups[1], i).per.filter((_, j) => groups[1].names[j] === k)))).join(' | ')} |`).join('\n') + '\n';
md += `\n## Types\n\n| Team | Repeated types | Uncovered weaknesses |\n|---|---|---|\n`;
teams.forEach((t, i) => { const m = teamDefense(t, dataset); const ty = t.flatMap(s => dataset.getPokemon(dataset.megaFormeFor(s.species, s.item) ?? s.species).types); md += `| ${label(files[i])} | ${[...new Set(ty.filter((x, k) => ty.indexOf(x) !== k))].join(', ') || 'none'} | ${m.rows.filter(r => r.weak && !(r.resist + r.immune)).map(r => r.type).join(', ') || 'none'} |\n`; });
md += `\n## Brought and led (fresh sets)\n\n`;
teams.forEach((t, i) => { const b = {}; for (const g of groups.slice(0, 2)) for (const [k, v] of Object.entries(at(g, i).bring)) { const a = (b[k] ??= [0, 0, 0]); v.forEach((x, j) => { a[j] += x; }); } const n = at(groups[0], i).n + at(groups[1], i).n;
  md += `- **${label(files[i])}:** ${Object.entries(b).sort((x, y) => y[1][0] - x[1][0]).map(([k, v]) => `${k} ${pct(v[0] / n)}% brought, ${pct(v[1] / n)}% led, ${pct(v[2] / v[0])}% won`).join('; ')}\n`; });
fs.writeFileSync(`${here}results/GAUNTLET.md`, md);
console.log('DONE'); P.close(); process.exit(0);
