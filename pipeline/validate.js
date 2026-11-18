// Sanity-checks the exported data, and compares it to hand-maintained reference lists
// (data/reference/regulation-m-c.json, copied from Bulbapedia / Pokémon-Zone) if present.
// Usage: npm run data:validate
import fs from 'node:fs';
import path from 'node:path';
import { PATHS } from './config.js';
import { readJson } from './lib/io.js';
import { validateDataset } from './lib/validate.js';

const load = f => readJson(path.join(PATHS.data, f));
const data = {
  pokemon: load('pokemon.json'),
  items: load('items.json'),
  moves: load('moves.json'),
  abilities: load('abilities.json'),
  learnsets: load('learnsets.json'),
};

// Expected shape: { "source": "...", "pokemon": ["Incineroar", ...], "items": ["Sitrus Berry", ...] }
const refFile = path.join(PATHS.reference, 'regulation-m-c.json');
const reference = fs.existsSync(refFile) ? readJson(refFile) : null;

const { errors, warnings } = validateDataset(data, reference);
if (!reference) warnings.push(`No reference list at ${path.relative(process.cwd(), refFile)}; skipped comparison against external lists.`);

for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(`\n${data.pokemon.length} Pokémon, ${data.items.length} items, ${data.moves.length} moves, ` +
  `${data.abilities.length} abilities — ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
