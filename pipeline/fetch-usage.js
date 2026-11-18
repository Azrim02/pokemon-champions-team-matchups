// Downloads Smogon "chaos" usage stats for the regulation and writes a trimmed summary.
// Usage: npm run data:usage [-- --month 2026-10 --cutoff 1760 --format gen9championsvgc2026regmcbo3 --top 10]
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, USAGE } from './config.js';
import { parseArgs, writeJson } from './lib/io.js';

const args = parseArgs();
const month = args.month ?? previousMonth();
const cutoff = Number(args.cutoff ?? USAGE.cutoff);
const formatId = args.format ?? USAGE.format;
const topN = Number(args.top ?? 10);

const name = `${formatId}-${cutoff}`;
const url = `${USAGE.baseUrl}/${month}/chaos/${name}.json`;
const dir = path.join(PATHS.usage, month);
const rawFile = path.join(dir, `${name}.raw.json`);

let raw;
if (fs.existsSync(rawFile) && !args.force) {
  console.log(`Using cached ${path.relative(process.cwd(), rawFile)} (--force to re-download)`);
  raw = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
} else {
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url} (stats are published early each month for the month before)`);
  raw = await res.json();
  writeJson(rawFile, raw);
}

// Each mon's sub-tables (Items, Moves…) are weighted counts; normalise them into percentages.
// Usage keys for abilities/items/moves are already Showdown IDs; species are display names.
const toId = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const toPct = (table, total, key = 'id') => Object.entries(table ?? {})
  .map(([k, v]) => ({ [key]: k, pct: round((v / total) * 100) }))
  .sort((a, b) => b.pct - a.pct)
  .slice(0, topN);
const round = n => Math.round(n * 100) / 100;

const pokemon = Object.entries(raw.data)
  .map(([mon, d]) => {
    const total = Object.values(d.Abilities ?? {}).reduce((a, b) => a + b, 0) || 1;
    return {
      id: toId(mon), // join to data/pokemon.json on id: names can differ (Sirfetch'd vs Sirfetch’d)
      name: mon,
      usagePct: round(d.usage * 100),
      rawCount: d['Raw count'],
      abilities: toPct(d.Abilities, total),
      items: toPct(d.Items, total),
      moves: toPct(d.Moves, total), // a mon has 4 moves, so these add up to ~400%
      spreads: toPct(d.Spreads, total, 'spread'), // Nature:HP/Atk/Def/SpA/SpD/Spe stat points
      teammates: Object.entries(d.Teammates ?? {})
        .sort((a, b) => b[1] - a[1]).slice(0, topN).map(([k]) => toId(k)),
      checksAndCounters: Object.entries(d['Checks and Counters'] ?? {})
        .map(([k, v]) => ({ id: toId(k), ...checkStats(v) }))
        .sort((a, b) => b.score - a.score).slice(0, topN),
    };
  })
  .sort((a, b) => b.usagePct - a.usagePct);

const summary = { source: url, month, format: formatId, cutoff, battles: raw.info?.['number of battles'], pokemon };
const summaryFile = path.join(dir, `${name}.json`);
writeJson(summaryFile, summary);
console.log(`Wrote ${pokemon.length} Pokémon to ${path.relative(process.cwd(), summaryFile)}`);

// Older stats store checks as [n, score, sd]; current ones as { n, p, d }.
// score = how often this mon KOs or forces out the subject in their encounters.
function checkStats(v) {
  const [n, score, sd] = Array.isArray(v) ? v : [v.n, v.p, v.d];
  return { score: round(score * 100), sd: round(sd * 100), n: round(n) };
}

function previousMonth() {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
}
