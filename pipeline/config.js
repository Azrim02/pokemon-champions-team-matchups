import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Showdown is pinned to a fixed commit. Its `champions` mod always tracks the *current*
 * regulation, and older regulations move into their own mods (e.g. `championsregmb`), so
 * update this pin on purpose when a new regulation starts.
 */
export const SHOWDOWN = {
  repo: 'https://github.com/smogon/pokemon-showdown.git',
  commit: '5b88c476113d51a939bddbcd00b5cd182a5d8058', // master @ 2026-11-18
  dir: path.join(ROOT, 'vendor', 'pokemon-showdown'),
};

export const REGULATION = {
  id: 'M-C',
  // Showdown format ID; the validator uses its ruleset (Flat Rules) to decide legality.
  format: 'gen9championsvgc2026regmc',
  start: '2026-09-09',
  end: '2026-12-02',
};

export const USAGE = {
  baseUrl: 'https://www.smogon.com/stats',
  // Formats that publish M-C stats: gen9championsvgc2026regmc, gen9championsvgc2026regmcbo3
  format: 'gen9championsvgc2026regmc',
  // Rating cutoffs that are published: 0, 1500, 1630, 1760
  cutoff: 1760,
};

export const PATHS = {
  data: path.join(ROOT, 'data'),
  usage: path.join(ROOT, 'data', 'usage'),
  reference: path.join(ROOT, 'data', 'reference'),
};
