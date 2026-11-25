// Full pipeline: build type-distinct teams, play Doubles games, tune, validate, write results/RESULTS.md.
// Saves a checkpoint after every batch, so a stopped run continues when started again.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { raw } from './sets.mjs';

const require = createRequire(import.meta.url);
const P = require('./pool.cjs');
const here = new URL('./', import.meta.url).pathname;
const root = new URL('../../', import.meta.url).pathname;
const { dataset } = await import(root + 'test/helpers/dataset.js');
const { validateTeam, defensiveProfile, effectiveness, exportTeam, parseTeam } = await import(root + 'src/index.js');
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
const CP = `${out}state.json`;
const state = fs.existsSync(CP) ? json(CP) : { res: {}, stages: {} };
const save = () => { fs.writeFileSync(CP + '.tmp', JSON.stringify(state)); fs.renameSync(CP + '.tmp', CP); };
const key = tm => tm.map(x => [x.s.species, x.s.item, x.s.nature, Object.values(x.s.evs).join('/'), x.s.moves.join('-')].join('|')).join(' + ');
const t0 = Date.now();
let played = 0;
const progress = (stage, done, total) => fs.writeFileSync(`${out}progress.json`, JSON.stringify(
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

// ---------- 1-3: structure search ----------
const M = X.find(x => x.s.species === 'Metagross'), RB = X.find(x => x.s.species === 'Rillaboom');
const rest = X.filter(x => !['Metagross', 'Rillaboom'].includes(x.s.species) && !x.types.some(t => ['Steel', 'Psychic', 'Grass'].includes(t)));
const one = []; for (const x of rest) if (one.filter(y => y.s.species === x.s.species).length < 2) one.push(x);
let cands = [], total = 0;
const dj = (a, b) => !a.types.some(t => b.types.includes(t)) && a.s.item !== b.s.item;
for (let i = 0; i < one.length; i++) for (let j = i + 1; j < one.length; j++) { if (!dj(one[i], one[j])) continue;
  for (let k = j + 1; k < one.length; k++) { if (!dj(one[i], one[k]) || !dj(one[j], one[k])) continue;
    for (let l = k + 1; l < one.length; l++) { if (!dj(one[i], one[l]) || !dj(one[j], one[l]) || !dj(one[k], one[l])) continue;
      const tm = [M, RB, one[i], one[j], one[k], one[l]];
      if (!tm.some(x => x.tw) || !tm.slice(2).some(x => x.support)) continue;
      const v = cover(tm); if (v.holes || v.stack > 3) continue;
      total++; cands.push({ tm, q: v.off * 10 - v.stack * .35 + Math.min(2, tm.slice(2).filter(x => x.support).length) * .15 });
      if (cands.length > 9000) { cands.sort((a, b) => b.q - a.q); cands.length = 5000; } } } }
cands.sort((a, b) => b.q - a.q);
const seen = {}, short = [];
for (const { tm } of cands) {
  const ks = tm.slice(2).map(x => x.s.species), id = '#' + [...ks].sort();
  if (seen[id] || ks.some(s => (seen[s] || 0) >= 70)) continue;
  seen[id] = 1; ks.forEach(s => { seen[s] = (seen[s] || 0) + 1; }); short.push(tm); if (short.length >= 420) break;
}
cands = null;
console.log('type-distinct teams', total, 'shortlist', short.length);
if (SMOKE) short.length = 5;
await play('s1', short, A, 1, 11);
let L = rank(short, ['s1']).slice(0, 110); await play('s2', L, A, 4, 23);
L = rank(L, ['s1', 's2']).slice(0, 30); await play('s3', L, A, 12, 37);
L = rank(L, ['s1', 's2', 's3']);

// ---------- 4-6: tune sets and swap members ----------
const neighbours = (tm, swap) => { const out = [];
  for (let i = 0; i < 6; i++) for (const x of X) {
    const same = x.s.species === tm[i].s.species;
    if ((!same && (i < 2 || !swap)) || x === tm[i]) continue;
    const t = [...tm]; t[i] = x; if (legal(t)) out.push(t);
  } return out; };
if (SMOKE) L = L.filter(t => state.res[key(t)]?.s1);
let N = uniq(L.slice(0, 4).flatMap(t => neighbours(t, true)));
if (N.length > 320) { N = N.sort((a, b) => cover(b).off - cover(a).off).slice(0, 320); }
await play('t1', N, A, 2, 51);
let best = rank(N, ['t1']).slice(0, 36); await play('t2', uniq([...best, ...L.slice(0, 6)]), A, 8, 67);
best = rank(uniq([...best, ...L.slice(0, 6)]), ['t2']).slice(0, 3);
const N2 = uniq(best.flatMap(t => neighbours(t, false))); await play('t3', N2, A, 4, 83);
let fin = uniq([...rank(N2, ['t3']).slice(0, 10), ...best, ...L.slice(0, 2)]); await play('t4', fin, A, 12, 97);
fin = rank(fin, ['t4']).slice(0, SMOKE ? 5 : 8);

// ---------- 7: validate on opponents the search never saw ----------
const base = ['metagross-salamence', 'metagross-hydreigon-talonflame', 'metagross-kommoo-tailwind'].map(f => {
  const tm = parseTeam(fs.readFileSync(`${root}web/src/teams/${f}.txt`, 'utf8')).map(wrap); tm.label = f; return tm; });
await play('val', [...fin, ...base], [...B, ...C], 10, 113, true);

// ---------- report ----------
const pct = x => (100 * x).toFixed(1);
const row = tm => { const e = state.res[key(tm)].val, p = e.w / e.n, se = Math.sqrt(p * (1 - p) / e.n); return { tm, e, p, se, v: cover(tm) }; };
const F = fin.map(row).sort((a, b) => b.p - a.p), BR = base.map(row);
const opps = [...B, ...C];
let md = `# Doubles search results\n\nWritten ${new Date().toISOString()} by \`tools/doubles-sim/run.mjs\`.\n\n`
  + `Reg M-C only: full 4v4 Doubles games in Showdown's engine, against sampled usage teams. ${total} teams had no repeated type and no uncovered weakness; `
  + `${short.length} played. Win rates below are on ${opps.length} opponent teams the search never saw (± one standard error).\n\n`
  + `| Team | Win rate | Repeated types | Uncovered weaknesses |\n|---|---|---|---|\n`
  + [...F.map((r, i) => ({ ...r, name: `${i + 1}. ${r.tm.map(x => x.s.species).join(', ')}` })), ...BR.map(r => ({ ...r, name: `Existing: ${r.tm.label}` }))]
    .map(r => `| ${r.name} | ${pct(r.p)} ± ${pct(r.se)} | ${r.v.dup} | ${r.v.holes} |`).join('\n') + '\n\n';
F.slice(0, 3).forEach((r, i) => {
  const worst = r.e.per.map((p, k) => [p, k]).sort((a, b) => a[0] - b[0]).slice(0, 6);
  md += `## ${i + 1}. ${r.tm.map(x => x.s.species).join(' / ')}\n\n\`\`\`\n${exportTeam(r.tm.map(x => x.s))}\`\`\`\n\n`
    + `| Pokémon | Brought | Led | Win rate when brought |\n|---|---|---|---|\n`
    + Object.entries(r.e.bring).sort((a, b) => b[1][0] - a[1][0]).map(([k, v]) => `| ${k} | ${pct(v[0] / r.e.n)}% | ${pct(v[1] / r.e.n)}% | ${pct(v[2] / v[0])}% |`).join('\n')
    + `\n\nMost used moves: ${Object.entries(r.e.mv).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${k} (${v})`).join(', ')}\n\n`
    + `Hardest opponents:\n\n${worst.map(([p, k]) => `- ${pct(p)}%: ${opps[k].map(s => `${s.species} @ ${s.item}`).join(', ')}`).join('\n')}\n\n`;
});
md += `Errors: ${JSON.stringify([...F, ...BR].map(r => r.e.st))}\n`;
fs.writeFileSync(`${out}RESULTS.md`, md);
progress('complete', 1, 1);
console.log('DONE'); P.close(); process.exit(0);
