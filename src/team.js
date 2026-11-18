// Showdown / Pokepaste team text ⇄ set objects, and M-C legality checks for a team.
//
// Set shape (same as Showdown's PokemonSet, with Stat Points stored in `evs`):
//   { name, species, item, ability, nature, gender, evs: {hp, atk, …}, moves: [names] }
// Showdown writes Champions Stat Points on the "EVs:" line; "SPs:" is accepted on import too.

import { toId, SP_LIMITS, STAT_IDS } from './data.js';

const STAT_NAMES = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };
const STAT_FROM_NAME = Object.fromEntries(Object.entries(STAT_NAMES).map(([id, n]) => [n.toLowerCase(), id]));

const emptyStats = () => Object.fromEntries(STAT_IDS.map(s => [s, 0]));

function parseStats(text) {
  const stats = emptyStats();
  for (const part of text.split('/')) {
    const m = part.trim().match(/^(\d+)\s+(\w+)$/);
    const stat = m && STAT_FROM_NAME[m[2].toLowerCase()];
    if (stat) stats[stat] = Number(m[1]);
  }
  return stats;
}

/** Parses the first line: "Nickname (Species) (M) @ Item". */
function parseHeader(line, set) {
  let rest = line;
  const at = rest.lastIndexOf(' @ ');
  if (at !== -1) {
    set.item = rest.slice(at + 3).trim();
    rest = rest.slice(0, at);
  }
  rest = rest.trim();
  const gender = rest.match(/\s\((M|F)\)$/);
  if (gender) {
    set.gender = gender[1];
    rest = rest.slice(0, gender.index).trim();
  }
  const nick = rest.match(/^(.*\S)\s+\(([^()]+)\)$/);
  if (nick) {
    set.name = nick[1];
    set.species = nick[2].trim();
  } else {
    set.species = rest;
  }
}

/** Parses a team (or a single set) in Showdown export format. */
export function parseTeam(text) {
  const sets = [];
  for (const block of text.replace(/\r\n?/g, '\n').split(/\n\s*\n/)) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
      .filter(l => !/^===.*===$/.test(l)); // Showdown teambuilder headers
    if (!lines.length) continue;
    const set = { name: '', species: '', item: '', ability: '', nature: '', gender: '', evs: emptyStats(), moves: [] };
    parseHeader(lines[0], set);
    for (const line of lines.slice(1)) {
      let m;
      if ((m = line.match(/^Ability:\s*(.+)$/i))) set.ability = m[1].trim();
      else if ((m = line.match(/^(?:EVs|SPs):\s*(.+)$/i))) set.evs = parseStats(m[1]);
      else if ((m = line.match(/^(\w+)\s+Nature$/i))) set.nature = m[1];
      else if ((m = line.match(/^[-~]\s*(.+)$/))) set.moves.push(m[1].trim());
      // Level, IVs, Tera Type, Shiny… don't apply in Champions and are ignored.
    }
    sets.push(set);
  }
  return sets;
}

/** Writes sets back to Showdown export format (Stat Points on the "EVs:" line, as Showdown does). */
export function exportTeam(sets) {
  return sets.map(set => {
    let out = set.name && set.name !== set.species ? `${set.name} (${set.species})` : set.species;
    if (set.gender) out += ` (${set.gender})`;
    if (set.item) out += ` @ ${set.item}`;
    out += '\n';
    if (set.ability) out += `Ability: ${set.ability}\n`;
    const evs = STAT_IDS.filter(s => set.evs?.[s]).map(s => `${set.evs[s]} ${STAT_NAMES[s]}`);
    if (evs.length) out += `EVs: ${evs.join(' / ')}\n`;
    if (set.nature) out += `${set.nature} Nature\n`;
    for (const move of set.moves) out += `- ${move}\n`;
    return out;
  }).join('\n');
}

/**
 * Checks a team against the exported M-C data and the Flat Rules.
 * @returns {string[]} problems; empty means legal (as far as the dataset can tell)
 */
export function validateTeam(sets, dataset) {
  const problems = [];
  const label = s => s.name || s.species || '(unnamed)';

  for (const set of sets) {
    const who = label(set);
    const species = dataset.getPokemon(set.species);
    if (!species) { problems.push(`${who}: ${set.species} is not legal in this regulation`); continue; }
    if (species.battleOnly) problems.push(`${who}: ${species.name} is a battle-only forme; register ${[species.battleOnly].flat().join(' / ')}`);

    if (set.item && !dataset.getItem(set.item)) problems.push(`${who}: item ${set.item} is not legal`);
    if (!set.ability) problems.push(`${who}: no ability`);
    else if (!Object.values(species.abilities).some(a => toId(a) === toId(set.ability))) {
      problems.push(`${who}: ${species.name} can't have ${set.ability}`);
    }

    if (!set.moves.length) problems.push(`${who}: no moves`);
    if (set.moves.length > 4) problems.push(`${who}: more than 4 moves`);
    if (new Set(set.moves.map(toId)).size !== set.moves.length) problems.push(`${who}: duplicate moves`);
    for (const move of set.moves) {
      if (!dataset.getMove(move)) problems.push(`${who}: move ${move} is not legal`);
      else if (!dataset.canLearn(species.id, move)) problems.push(`${who}: ${species.name} can't learn ${move}`);
    }

    let total = 0;
    for (const stat of STAT_IDS) {
      const sp = set.evs?.[stat] ?? 0;
      total += sp;
      if (sp < 0 || sp > SP_LIMITS.perStat) problems.push(`${who}: ${sp} Stat Points in ${STAT_NAMES[stat]} (max ${SP_LIMITS.perStat})`);
    }
    if (total > SP_LIMITS.total) problems.push(`${who}: ${total} Stat Points in total (max ${SP_LIMITS.total})`);
  }

  // Flat Rules: Species Clause and Item Clause = 1.
  const dupes = (key, what) => {
    const seen = new Map();
    for (const set of sets) {
      const k = key(set);
      if (!k) continue;
      if (seen.has(k)) problems.push(`${what} Clause: ${label(seen.get(k))} and ${label(set)} share ${what.toLowerCase()} ${k}`);
      else seen.set(k, set);
    }
  };
  // Species Clause is by Pokédex number, so formes (Rotom-Wash and Rotom-Heat) count as the same species.
  dupes(s => dataset.getPokemon(s.species)?.baseSpecies, 'Species');
  dupes(s => s.item && dataset.getItem(s.item)?.name, 'Item');
  if (sets.length > 6) problems.push(`Team has ${sets.length} Pokémon (max 6)`);

  return problems;
}
