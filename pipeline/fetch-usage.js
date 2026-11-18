// Downloads Smogon "chaos" usage stats for the regulation and writes a trimmed summary.
// Usage: npm run data:usage [-- --month 2026-10 --cutoff 1760 --format gen9championsvgc2026regmcbo3 --top 10]
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, USAGE } from './config.js';
import { parseArgs, writeJson } from './lib/io.js';
import { summarizeUsage, previousMonth } from './lib/usage.js';

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


// Join to data/pokemon.json on `id`: names can differ (Sirfetch'd vs Sirfetch’d).
const pokemon = summarizeUsage(raw, { topN });

const summary = { source: url, month, format: formatId, cutoff, battles: raw.info?.['number of battles'], pokemon };
const summaryFile = path.join(dir, `${name}.json`);
writeJson(summaryFile, summary);
console.log(`Wrote ${pokemon.length} Pokémon to ${path.relative(process.cwd(), summaryFile)}`);
