// Writes web/src/plays/<team id>.json for the dashboard's Play tab, from the gauntlet's fresh sets and the
// hand-written notes in guide-notes.json. Usage: node guide.mjs <gauntlet file name> <team id> [state file]
import fs from 'node:fs';

const here = new URL('./', import.meta.url).pathname, root = new URL('../../', import.meta.url).pathname;
const json = f => JSON.parse(fs.readFileSync(f));
const { parseTeam } = await import(root + 'src/index.js');
const [file, id, stateFile = `${here}results/gauntlet-state.json`] = process.argv.slice(2);
const team = parseTeam(fs.readFileSync(`${here}gauntlet/${file}`, 'utf8'));
const st = json(stateFile), tk = JSON.stringify(team);
const usage = st[`Fresh usage | ${tk}`], arch = st[`Fresh archetypes | ${tk}`];
if (!usage || !arch) throw new Error('This team has no fresh gauntlet results');
const uOpp = json(`${here}data/oppI.json`), aOpp = json(`${here}data/oppArchNew.json`), names = json(`${here}data/oppArchNew-names.json`);
const notes = json(`${here}guide-notes.json`);

const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const se = a => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / Math.max(1, a.length - 1) / a.length); };
const round = x => Math.round(x * 1000) / 1000;
const merge = (...os) => { const o = {}; for (const x of os) for (const k in x ?? {}) { const a = (o[k] ??= x[k].map(() => 0)); x[k].forEach((v, i) => { a[i] += v; }); } return o; };
const list = (o, min) => Object.entries(o).filter(([, v]) => v[0] >= min).sort((a, b) => b[1][0] - a[1][0]);
const n = usage.n + arch.n;
const bring = merge(usage.bring, arch.bring), lead = merge(usage.lead, arch.lead), four = merge(usage.four, arch.four), t1 = merge(usage.t1, arch.t1);
const moves = {}; for (const r of [usage, arch]) for (const [k, v] of Object.entries(r.mv)) moves[k] = (moves[k] ?? 0) + v;
const pair = k => k.split(' + ');

const mons = team.map(s => {
  const [b, l, w] = bring[s.species] ?? [0, 0, 0];
  const own = Object.entries(moves).filter(([k]) => k.startsWith(s.species + ':')).map(([k, v]) => [k.split(':')[1].trim(), v]);
  const tot = own.reduce((a, x) => a + x[1], 0) || 1;
  return { species: s.species, role: notes.roles[s.species] ?? '', brought: round(b / n), led: round(l / n), won: b ? round(w / b) : 0,
    moves: own.sort((a, b2) => b2[1] - a[1]).slice(0, 4).map(([m, v]) => ({ move: m, share: round(v / tot) })) };
});
const archetypes = [...new Set(names)].map(name => {
  const ix = names.map((x, i) => (x === name ? i : -1)).filter(i => i >= 0);
  const l = list(merge(...ix.map(i => arch.oppLead?.[i])), 1).slice(0, 3);
  return { name, win: round(mean(ix.map(i => arch.per[i]))), games: ix.length * Math.round(arch.n / arch.per.length),
    leads: l.map(([k, v]) => ({ pair: pair(k), games: v[0], win: round(v[1] / v[0]) })), note: notes.archetypes[name] ?? '' };
}).sort((a, b) => b.win - a.win);
const hardest = [...usage.per.map((p, i) => [p, uOpp[i]]), ...arch.per.map((p, i) => [p, aOpp[i]])].sort((a, b) => a[0] - b[0]).slice(0, 5)
  .map(([p, o]) => ({ win: round(p), team: o.map(s => `${s.species} @ ${s.item}`) }));

// Shortest won game, turned into one list of steps per turn.
const all = [...(arch.sample ?? []).map((s, i) => [s, aOpp[i], names[i]]), ...(usage.sample ?? []).map((s, i) => [s, uOpp[i], 'Usage team'])].filter(([s]) => s && s.turns >= 5);
all.sort((a, b) => a[0].turns - b[0].turns);
let sample = null;
if (all.length) {
  const [s, o, kind] = all[0];
  const who = x => (x.startsWith('p1') ? 'You: ' : 'Opponent: ') + x.replace(/^p[12][ab]?: /, '');
  const turns = [{ turn: 0, steps: [] }];
  for (const l of s.log) {
    const [, k, a, b, c] = l.split('|');
    if (k === 'turn') turns.push({ turn: +a, steps: [] });
    const step = k === 'move' ? `${who(a)} uses ${b}${c && /^p[12][ab]: /.test(c) && c !== a ? ` on ${c.replace(/^p[12][ab]: /, '')}` : ''}`
      : k === 'switch' || k === 'drag' ? `${who(a)} comes in` : k === 'faint' ? `${who(a)} faints` : k === '-mega' ? `${who(a)} Mega Evolves` : k === 'cant' ? `${who(a)} can't move (${b})` : null;
    if (step) turns.at(-1).steps.push(step);
  }
  sample = { kind, opponent: o.map(x => x.species), turns: turns.filter(t => t.steps.length) };
}

const guide = {
  id, species: team.map(s => s.species), games: n, opponents: usage.per.length + arch.per.length,
  overall: { usage: { win: round(mean(usage.per)), se: round(se(usage.per)) }, archetypes: { win: round(mean(arch.per)), se: round(se(arch.per)) } },
  sets: team.map(s => ({ species: s.species, item: s.item, moves: s.moves })),
  plan: notes.plan, cautions: notes.cautions, mons,
  leads: list(lead, 20).slice(0, 8).map(([k, v]) => ({ pair: pair(k), games: v[0], win: round(v[1] / v[0]) })),
  fours: list(four, 10).slice(0, 6).map(([k, v]) => ({ lead: pair(k.split(' / ')[0]), back: pair(k.split(' / ')[1]), games: v[0], win: round(v[1] / v[0]) })),
  turn1: list(t1, 10).slice(0, 8).map(([k, v]) => ({ mon: k.split(':')[0], move: k.split(':')[1].trim(), games: v[0] })),
  archetypes, hardest, sample,
};
fs.mkdirSync(`${root}web/src/plays`, { recursive: true });
fs.writeFileSync(`${root}web/src/plays/${id}.json`, JSON.stringify(guide, null, 1) + '\n');
console.log(id, n, 'games', guide.overall);
