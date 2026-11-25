// Second pass around the best team from results/RESULTS.md, with every team-preview choice considered
// (PREVIEW=full): member swaps, set variants and the best structures of the first pass, then a
// validation on opponents nothing was selected on. Writes results/REFINED.md.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { raw } from './sets.mjs';

const require = createRequire(import.meta.url);
const P = require('./pool.cjs');
const here = new URL('./', import.meta.url).pathname;
const root = new URL('../../', import.meta.url).pathname;
const { dataset } = await import(root + 'test/helpers/dataset.js');
const { validateTeam, defensiveProfile, effectiveness, exportTeam, parseTeam } = await import(root + 'src/index.js');
process.env.PREVIEW ??= 'full';
const json = f => JSON.parse(fs.readFileSync(f));
// SMOKE=1 runs every stage at a tiny size, with its own checkpoint, to check that nothing crashes.
const SMOKE = !!process.env.SMOKE;
const out = `${here}results/${SMOKE ? 'smoke-' : ''}`;
const [A, B, C] = ['A', 'B', 'C'].map(k => json(`${here}data/opp${k}.json`).slice(0, SMOKE ? 2 : undefined));
const usage = json(`${root}data/usage/2026-10/gen9championsvgc2026regmc-1760.json`);
const T = Object.keys(dataset.typechart);

// ---------- sets and type checks ----------
const sets = raw.filter(s => !validateTeam([s], dataset).length);
const wrap = s => {
  const f = dataset.getPokemon(dataset.megaFormeFor(s.species, s.item) ?? s.species);
  const ability = f.isMega ? Object.values(f.abilities)[0] : s.ability;
  const atk = new Set(s.moves.map(m => dataset.getMove(m)).filter(m => m.category !== 'Status').map(m =>
    s.ability === 'Liquid Voice' && m.name === 'Hyper Voice' ? 'Water' : s.ability === 'Pixilate' && m.type === 'Normal' ? 'Fairy' : m.type));
  const all = s.moves.join();
  return { s, types: f.types, def: defensiveProfile(f.types, dataset.typechart, ability), atk: [...atk],
    tw: s.moves.includes('Tailwind'),
    support: s.ability === 'Intimidate' || /Fake Out|Follow Me|Rage Powder|U-turn|Parting Shot|Flip Turn|Volt Switch/.test(all) };
};
const X = sets.map(wrap);
const thr = usage.pokemon.slice(0, 40).map(p => ({ t: dataset.getPokemon(p.id).types, w: p.usagePct }));
const W = thr.reduce((a, x) => a + x.w, 0);
function cover(tm) {
  let holes = 0, stack = 0, off = 0;
  for (const t of T) {
    const weak = tm.filter(x => x.def[t] > 1).length, res = tm.filter(x => x.def[t] < 1).length;
    if (weak && !res) holes++;
    stack += Math.max(0, weak - res) + (weak >= 3 ? 1 : 0);
  }
  for (const o of thr) off += o.w * Math.min(3, tm.filter(x => x.atk.some(a => effectiveness(a, o.t, dataset.typechart) > 1)).length) / 3;
  const types = tm.flatMap(x => x.types);
  return { holes, stack, off: off / W, dup: types.length - new Set(types).size };
}
const legal = tm => {
  const v = cover(tm);
  return v.dup === 0 && v.holes === 0 && v.stack <= 3 && new Set(tm.map(x => x.s.item)).size === 6
    && tm.some(x => x.tw) && tm.slice(2).some(x => x.support) && !validateTeam(tm.map(x => x.s), dataset).length;
};

// ---------- checkpointed evaluation ----------
const CP = `${out}refine-state.json`;
const state = fs.existsSync(CP) ? json(CP) : { res: {}, stages: {} };
const save = () => { fs.writeFileSync(CP + '.tmp', JSON.stringify(state)); fs.renameSync(CP + '.tmp', CP); };
const key = tm => tm.map(x => [x.s.species, x.s.item, x.s.nature, Object.values(x.s.evs).join('/'), x.s.moves.join('-')].join('|')).join(' + ');
const t0 = Date.now();
let played = 0;
const progress = (stage, done, total) => fs.writeFileSync(`${out}refine-progress.json`, JSON.stringify(
  { stage, done, total, gamesThisRun: played, secondsThisRun: Math.round((Date.now() - t0) / 1000), at: new Date().toISOString() }));
async function play(stage, teams, opps, games, seed, detail = false) {
  if (SMOKE) { games = 1; teams = teams.slice(0, 5).concat(detail ? teams.slice(-3) : []); }
  const SZ = detail ? 2 : 10;
  for (let i = 0; i < teams.length; i += SZ) {
    progress(stage, i, teams.length);
    const todo = teams.slice(i, i + SZ).filter(tm => !(state.res[key(tm)]?.[stage]));
    if (!todo.length) continue;
    const r = await P.evalTeams(todo.map(tm => tm.map(x => x.s)), opps, games, seed, detail);
    r.forEach((x, k) => {
      const e = (state.res[key(todo[k])] ??= {});
      e[stage] = { w: x.w, n: x.n, per: x.per, ...(detail ? { mv: x.mv, bring: x.bring } : {}), st: x.st };
      played += x.n;
    });
    save();
  }
  progress(stage, teams.length, teams.length);
}
const pooled = (tm, stages) => { let w = 0, n = 0; for (const s of stages) { const e = state.res[key(tm)]?.[s]; if (e) { w += e.w; n += e.n; } } return { p: n ? w / n : 0, n }; };
const rank = (teams, stages) => [...teams].sort((a, b) => pooled(b, stages).p - pooled(a, stages).p);
const uniq = teams => [...new Map(teams.map(t => [key(t), t])).values()];

const pct = x => (100 * x).toFixed(1);

const D = json(`${here}data/oppD.json`), E = json(`${here}data/oppE.json`);
const md0 = fs.readFileSync(`${here}results/RESULTS.md`, 'utf8');
const seedTeam = parseTeam(md0.match(/```\n([\s\S]*?)```/)[1]).map(wrap);
const old = json(`${here}results/state.json`).res;
const byKey = new Map(X.map(x => [key([x]), x]));
const first = Object.entries(old).filter(([, e]) => e.s3).sort((a, b) => b[1].s3.w / b[1].s3.n - a[1].s3.w / a[1].s3.n).slice(0, 20)
  .map(([k]) => k.split(' + ').map(p => byKey.get(p))).filter(t => t.every(Boolean) && legal(t));
const neigh = (tm, swap) => { const o = []; for (let i = 0; i < 6; i++) for (const x of X) {
  const same = x.s.species === tm[i].s.species; if ((!same && (i < 2 || !swap)) || x === tm[i]) continue;
  const t = [...tm]; t[i] = x; if (legal(t)) o.push(t); } return o; };
const train = [...B, ...C];
const sub = train.filter((_, k) => k % 2 === 0);
const N1 = uniq([seedTeam, ...first, ...neigh(seedTeam, true)]);
console.log('r1 teams', N1.length);
await play('r1', N1, sub, 3, 201);
const top = rank(N1, ['r1']).slice(0, 24); await play('r2', uniq([seedTeam, ...top]), train, 5, 223);
const b3 = rank(uniq([seedTeam, ...top]), ['r2']).slice(0, 4);
console.log('after r2'); for (const t of rank(uniq([seedTeam, ...top]), ['r2']).slice(0, 10)) console.log(pct(pooled(t, ['r2']).p), key(t));
const N2 = uniq(b3.flatMap(t => neigh(t, false))); console.log('r3 teams', N2.length);
await play('r3', N2, sub, 3, 241);
const top2 = uniq([...rank(N2, ['r3']).slice(0, 16), ...b3]); await play('r4', top2, [...train, ...D], 5, 263);
const fin = uniq([...rank(top2, ['r4']).slice(0, 5), seedTeam]);
const base = ['metagross-salamence', 'metagross-hydreigon-talonflame'].map(f => { const t = parseTeam(fs.readFileSync(`${root}web/src/teams/${f}.txt`, 'utf8')).map(wrap); t.label = f; return t; });
await play('val', [...fin, ...base], E, 10, 307, true);
const stat = tm => { const e = state.res[key(tm)].val; const m = e.w / e.n; const se = Math.sqrt(e.per.reduce((a, b) => a + (b - m) ** 2, 0) / (e.per.length - 1) / e.per.length); return { tm, e, m, se, v: cover(tm) }; };
const R = [...fin, ...base].map(stat); const sal = R.find(r => r.tm.label === 'metagross-salamence');
let md = `# Refined Doubles results\n\nWritten ${new Date().toISOString()} by \`refine.mjs\`. Validation: ${E.length} opponents used for nothing else, 10 games each. ± is the standard error across opponents.\n\n| Team | Selection win rate | Validation win rate | vs Salamence team | Repeated types | Uncovered |\n|---|---|---|---|---|---|\n`;
for (const r of R) { const d = r.e.per.map((p, i) => p - sal.e.per[i]), dm = d.reduce((a, b) => a + b, 0) / d.length, ds = Math.sqrt(d.reduce((a, b) => a + (b - dm) ** 2, 0) / (d.length - 1) / d.length);
  md += `| ${r.tm.label ?? (r.tm === seedTeam ? 'First-pass winner' : r.tm.map(x => x.s.species).join(', '))} | ${r.tm.label ? '' : pct(pooled(r.tm, ['r4']).p)} | ${pct(r.m)} ± ${pct(r.se)} | ${pct(dm)} ± ${pct(ds)} | ${r.v.dup} | ${r.v.holes} |\n`; }
for (const r of R.filter(r => !r.tm.label).slice(0, 6)) md += `\n## ${pct(r.m)}%\n\n\`\`\`\n${exportTeam(r.tm.map(x => x.s))}\`\`\`\n\n${Object.entries(r.e.bring).map(([k, v]) => `${k}: brought ${pct(v[0] / r.e.n)}%, led ${pct(v[1] / r.e.n)}%, won ${pct(v[2] / v[0])}%`).join('; ')}\n\nMoves: ${Object.entries(r.e.mv).sort((a, b) => b[1] - a[1]).slice(0, 24).map(x => x.join(' ')).join(', ')}\n\nHardest: ${r.e.per.map((p, k) => [p, k]).sort((a, b) => a[0] - b[0]).slice(0, 6).map(([p, k]) => pct(p) + '% ' + E[k].map(s => s.species).join('/')).join('; ')}\n`;
fs.writeFileSync(`${out}REFINED.md`, md); progress('complete', 1, 1); console.log('DONE'); P.close(); process.exit(0);
