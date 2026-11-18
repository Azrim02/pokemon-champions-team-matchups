/** Showdown-style ID: lowercase alphanumerics only ("Sirfetch’d" → "sirfetchd"). */
export const toId = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');

const round = n => Math.round(n * 100) / 100;

/** Weighted-count table → top-N [{ [key]: name, pct }], as a percentage of `total`. */
function toPct(table, total, topN, key = 'id') {
  return Object.entries(table ?? {})
    .map(([k, v]) => ({ [key]: k, pct: round((v / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, topN);
}

/**
 * Older stats store checks as [n, score, sd]; current ones as { n, p, d }.
 * score = how often this mon KOs or forces out the subject in their encounters (%).
 */
export function checkStats(v) {
  const [n, score, sd] = Array.isArray(v) ? v : [v.n, v.p, v.d];
  return { score: round(score * 100), sd: round(sd * 100), n: round(n) };
}

/**
 * Trims a Smogon "chaos" usage file into a dashboard-friendly summary.
 * Ability/item/move keys in chaos files are already IDs; species keys are display names,
 * so every species reference is converted to an ID for joining with data/pokemon.json.
 */
export function summarizeUsage(raw, { topN = 10 } = {}) {
  return Object.entries(raw.data)
    .map(([mon, d]) => {
      // Every set has exactly one ability, so the ability weights sum to the mon's total weight.
      const total = Object.values(d.Abilities ?? {}).reduce((a, b) => a + b, 0) || 1;
      return {
        id: toId(mon),
        name: mon,
        usagePct: round(d.usage * 100),
        rawCount: d['Raw count'],
        abilities: toPct(d.Abilities, total, topN),
        items: toPct(d.Items, total, topN),
        moves: toPct(d.Moves, total, topN), // a mon has 4 moves, so these add up to ~400%
        spreads: toPct(d.Spreads, total, topN, 'spread'), // Nature:HP/Atk/Def/SpA/SpD/Spe stat points
        teammates: Object.entries(d.Teammates ?? {})
          .sort((a, b) => b[1] - a[1]).slice(0, topN).map(([k]) => toId(k)),
        checksAndCounters: Object.entries(d['Checks and Counters'] ?? {})
          .map(([k, v]) => ({ id: toId(k), ...checkStats(v) }))
          .sort((a, b) => b.score - a.score).slice(0, topN),
      };
    })
    .sort((a, b) => b.usagePct - a.usagePct);
}

/** "YYYY-MM" of the month before `now`; Smogon publishes stats early in the following month. */
export function previousMonth(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return d.toISOString().slice(0, 7);
}
