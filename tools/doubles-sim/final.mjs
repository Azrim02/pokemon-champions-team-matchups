// Third pass: rerank the second pass's best teams and the best first-pass structures against opponents that
// match ladder usage (F) and 13 archetypes (Arch), then validate on held-out sets of both (H, ArchTest).
// Writes results/FINAL.md.
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
const CP = `${out}final-state.json`;
const state = fs.existsSync(CP) ? json(CP) : { res: {}, stages: {} };
const save = () => { fs.writeFileSync(CP + '.tmp', JSON.stringify(state)); fs.renameSync(CP + '.tmp', CP); };
const key = tm => tm.map(x => [x.s.species, x.s.item, x.s.nature, Object.values(x.s.evs).join('/'), x.s.moves.join('-')].join('|')).join(' + ');
const t0 = Date.now();
let played = 0;
const progress = (stage, done, total) => fs.writeFileSync(`${out}final-progress.json`, JSON.stringify(
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


const F = json(`${here}data/oppF.json`), AR = json(`${here}data/oppArch.json`), H = json(`${here}data/oppH.json`), AT = json(`${here}data/oppArchTest.json`);
const names = json(`${here}data/oppArchTest-names.json`);
const byKey = new Map(X.map(x => [key([x]), x]));
const toTeam = k => { const t = k.split(' + ').map(p => byKey.get(p)); return t.every(Boolean) ? t : null; };
const s1 = json(`${here}results/state.json`).res, s2 = json(`${here}results/refine-state.json`).res;
const best = (res, st, n) => Object.entries(res).filter(([, e]) => e[st]).sort((a, b) => b[1][st].w / b[1][st].n - a[1][st].w / a[1][st].n).slice(0, n).map(([k]) => toTeam(k)).filter(Boolean);
const seedTeam = parseTeam(fs.readFileSync(`${here}results/RESULTS.md`, 'utf8').match(/```\n([\s\S]*?)```/)[1]).map(wrap);
const neigh = (tm, swap) => { const o = []; for (let i = 0; i < 6; i++) for (const x of X) {
  const same = x.s.species === tm[i].s.species; if ((!same && (i < 2 || !swap)) || x === tm[i]) continue;
  const t = [...tm]; t[i] = x; if (legal(t)) o.push(t); } return o; };
const base = ['metagross-salamence', 'metagross-hydreigon-talonflame'].map(f => { const t = parseTeam(fs.readFileSync(`${root}web/src/teams/${f}.txt`, 'utf8')).map(wrap); t.label = f; return t; });
const struct = new Map(); for (const t of [...best(s1, 's3', 30), ...best(s1, 't2', 20)]) { const k = t.map(x => x.s.species).sort().join(); if (!struct.has(k)) struct.set(k, t); }
const P1 = uniq([seedTeam, ...best(s2, 'r4', 14), ...best(s2, 'r2', 10), ...struct.values(), ...base]);
console.log('f1 teams', P1.length);
const third = (a, o) => a.filter((_, k) => k % 3 === o);
await play('f1', P1, [...third(F, 0), ...third(AR, 1)], 3, 401);
const t1 = rank(P1.filter(t => !t.label), ['f1']).slice(0, 14);
const N = uniq([...t1, ...t1.slice(0, 2).flatMap(t => neigh(t, true))]); console.log('f2 teams', N.length);
await play('f2', N, [...third(F, 1), ...third(AR, 2)], 3, 433);
const t2 = uniq(rank(N, ['f2']).slice(0, 14).concat(rank(t1, ['f1', 'f2']).slice(0, 4)));
await play('f3', t2, [...F, ...AR], 4, 467);
const fin = uniq([...rank(t2, ['f3']).slice(0, 5), seedTeam]);
await play('val', [...fin, ...base], [...H, ...AT], 8, 509, true);
const all = [...fin, ...base];
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const se = a => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1) / a.length); };
const R = all.map(tm => { const e = state.res[key(tm)].val; const u = e.per.slice(0, H.length), a = e.per.slice(H.length); return { tm, e, u, a, v: cover(tm) }; });
const sal = R.find(r => r.tm.label === 'metagross-salamence');
const nm = r => r.tm.label ?? (r.tm === seedTeam ? 'First-pass winner' : r.tm.map(x => x.s.species).join(', '));
const diff = (r, k) => { const d = r[k].map((p, i) => p - sal[k][i]); return `${pct(mean(d))} ± ${pct(se(d))}`; };
let md = `# Final Doubles results\n\nWritten ${new Date().toISOString()} by \`final.mjs\`. Validation only: ${H.length} usage-matched teams and ${AT.length} archetype teams that nothing was selected on, 8 games each. ± is the standard error across opponents.\n\n| # | Team | Usage teams | Archetypes | vs Salamence team (usage) | vs Salamence team (archetypes) | Selection score | Repeated types | Uncovered |\n|---|---|---|---|---|---|---|---|---|\n`;
R.forEach((r, i) => { md += `| ${i + 1} | ${nm(r)} | ${pct(mean(r.u))} ± ${pct(se(r.u))} | ${pct(mean(r.a))} ± ${pct(se(r.a))} | ${diff(r, 'u')} | ${diff(r, 'a')} | ${r.tm.label ? '' : pct(pooled(r.tm, ['f3']).p)} | ${r.v.dup} | ${r.v.holes} |\n`; });
const kinds = [...new Set(names)];
md += `\n## By archetype\n\n| Archetype | ${R.map((_, i) => i + 1).join(' | ')} |\n|---|${R.map(() => '---').join('|')}|\n` + kinds.map(k => `| ${k} | ${R.map(r => pct(mean(r.a.filter((_, i) => names[i] === k)))).join(' | ')} |`).join('\n') + '\n';
R.filter(r => !r.tm.label).forEach((r, i) => { md += `\n## Team ${i + 1}\n\n\`\`\`\n${exportTeam(r.tm.map(x => x.s))}\`\`\`\n\n${Object.entries(r.e.bring).sort((a, b) => b[1][0] - a[1][0]).map(([k, v]) => `${k}: brought ${pct(v[0] / r.e.n)}%, led ${pct(v[1] / r.e.n)}%, won ${pct(v[2] / v[0])}%`).join('; ')}\n\nMoves: ${Object.entries(r.e.mv).sort((a, b) => b[1] - a[1]).slice(0, 26).map(x => x.join(' ')).join(', ')}\n`; });
fs.writeFileSync(`${out}FINAL.md`, md); progress('complete', 1, 1); console.log('DONE'); P.close(); process.exit(0);
