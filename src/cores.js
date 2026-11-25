// Defensive cores: which team members cover each other's type weaknesses.
// Works on the matrix from teamDefense(), so abilities and Mega formes are already included.

function* combinations(n, size, start = 0) {
  if (size === 0) { yield []; return; }
  for (let i = start; i <= n - size; i++) {
    for (const rest of combinations(n, size - 1, i + 1)) yield [i, ...rest];
  }
}

/**
 * Members are referred to by their index in `matrix.members`.
 * - `weaknesses[i]`: types that hit member i for more than 1x.
 * - `links`: `by` takes less than 1x from `types`, which are weaknesses of `of`.
 * - `cores`: pairs and trios where every member covers, and is covered by, another member.
 *   `holes` are the weaknesses nobody in the core resists. Trios with no fewer holes than a pair
 *   inside them are left out. Sorted by fewest holes, then smallest.
 * @param {{ members: string[], rows: { type: string, multipliers: number[] }[] }} matrix
 */
export function defensiveCores(matrix) {
  const n = matrix.members.length;
  const weaknesses = matrix.members.map((_, i) => matrix.rows.filter(r => r.multipliers[i] > 1).map(r => r.type));
  const row = Object.fromEntries(matrix.rows.map(r => [r.type, r.multipliers]));

  const links = [];
  for (let of = 0; of < n; of++) {
    for (let by = 0; by < n; by++) {
      if (of === by) continue;
      const types = weaknesses[of].filter(t => row[t][by] < 1);
      if (types.length) links.push({ of, by, types });
    }
  }

  const cores = [];
  for (const size of [2, 3]) {
    for (const members of combinations(n, size)) {
      const inside = links.filter(l => members.includes(l.of) && members.includes(l.by));
      if (!members.every(m => inside.some(l => l.of === m) && inside.some(l => l.by === m))) continue;
      const holes = members.flatMap(member => weaknesses[member]
        .filter(t => !inside.some(l => l.of === member && l.types.includes(t)))
        .map(type => ({ member, type })));
      if (cores.some(c => c.holes.length <= holes.length && c.members.every(m => members.includes(m)))) continue;
      cores.push({ members, holes });
    }
  }
  cores.sort((a, b) => a.holes.length - b.holes.length || a.members.length - b.members.length);
  return { weaknesses, links, cores };
}
