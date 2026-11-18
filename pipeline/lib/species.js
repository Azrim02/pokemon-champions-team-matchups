/**
 * Picks the species to export from Showdown's species list.
 * - Cosmetic formes (Vivillon patterns, Alcremie flavours…) are dropped; they're listed on the base.
 * - Battle-only formes (Megas, Palafin-Hero…) are kept only if the forme they change from is legal.
 *   The validator checks formes in isolation, so e.g. Ogerpon-*-Tera would slip through otherwise.
 *
 * @param {object[]} all Showdown Species objects
 * @param {(species: object) => boolean} isLegal format-level legality check for a single forme
 */
export function selectLegalSpecies(all, isLegal) {
  const candidates = all.filter(s => s.exists && !s.isCosmeticForme && isLegal(s));
  const outOfBattle = new Set(candidates.filter(s => !s.battleOnly).map(s => s.name));
  return candidates
    .filter(s => !s.battleOnly || [s.battleOnly].flat().some(name => outOfBattle.has(name)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Showdown damageTaken codes → multiplier. */
const DAMAGE_TAKEN = { 0: 1, 1: 2, 2: 0.5, 3: 0 };

/**
 * Builds typechart[attacking][defending] = multiplier.
 * @param {{name: string, damageTaken: Record<string, number>}[]} types
 */
export function buildTypechart(types) {
  const names = types.map(t => t.name);
  const chart = {};
  for (const atk of names) {
    chart[atk] = {};
    for (const def of types) chart[atk][def.name] = DAMAGE_TAKEN[def.damageTaken[atk] ?? 0];
  }
  return chart;
}
