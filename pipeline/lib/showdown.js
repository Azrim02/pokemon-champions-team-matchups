import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SHOWDOWN, REGULATION } from '../config.js';

const require = createRequire(import.meta.url);

/** Loads the built Showdown sim and returns the dex and validator for the regulation's format. */
export function loadFormat(formatId = REGULATION.format) {
  const simPath = path.join(SHOWDOWN.dir, 'dist', 'sim');
  if (!fs.existsSync(simPath)) {
    throw new Error('Showdown is not built. Run `npm run setup:showdown` first.');
  }
  const { Dex, TeamValidator } = require(simPath);
  const format = Dex.formats.get(formatId, true);
  if (!format.exists) throw new Error(`Unknown Showdown format: ${formatId}`);
  return { format, dex: Dex.forFormat(format), validator: TeamValidator.get(format) };
}

/** True if the species passes the format's species checks (bans, Mythical/Restricted, unobtainable). */
export function isLegalSpecies(validator, species) {
  const set = {
    name: '', species: species.name, item: '', ability: '', moves: [],
    nature: '', gender: '', evs: {}, ivs: {}, level: 50,
  };
  return !validator.checkSpecies(set, species, species, {});
}

/** True if the item is legal in the format. */
export function isLegalItem(validator, item) {
  if (!item.exists || item.isNonstandard) return false;
  return !validator.ruleTable.isBanned(`item:${item.id}`);
}
