// Type matchup matrices: a team's defensive weaknesses and its offensive coverage.
// Type-only on purpose (no stats); use the damage calc for real numbers.

/**
 * Abilities that change how much damage a type does to the holder. Only ability effects that
 * are purely type-based are listed; conditional ones (e.g. Wonder Guard) are left out.
 */
export const ABILITY_TYPE_MODIFIERS = {
  'Levitate': { Ground: 0 },
  'Earth Eater': { Ground: 0 },
  'Flash Fire': { Fire: 0 },
  'Well-Baked Body': { Fire: 0 },
  'Water Absorb': { Water: 0 },
  'Storm Drain': { Water: 0 },
  'Dry Skin': { Water: 0, Fire: 1.25 },
  'Volt Absorb': { Electric: 0 },
  'Lightning Rod': { Electric: 0 },
  'Motor Drive': { Electric: 0 },
  'Sap Sipper': { Grass: 0 },
  'Thick Fat': { Fire: 0.5, Ice: 0.5 },
  'Heatproof': { Fire: 0.5 },
  'Water Bubble': { Fire: 0.5 },
  'Purifying Salt': { Ghost: 0.5 },
  'Fluffy': { Fire: 2 },
};

/** Multiplier of an attacking type against a list of defending types. */
export function effectiveness(attackType, defendTypes, typechart) {
  return defendTypes.reduce((m, t) => m * (typechart[attackType]?.[t] ?? 1), 1);
}

/** { [attackingType]: multiplier } for one Pokémon, including its ability's type modifiers. */
export function defensiveProfile(types, typechart, ability = null) {
  const mods = ABILITY_TYPE_MODIFIERS[ability] ?? {};
  return Object.fromEntries(Object.keys(typechart).map(atk => [
    atk, effectiveness(atk, types, typechart) * (mods[atk] ?? 1),
  ]));
}

/**
 * Team defence matrix: one row per attacking type, one column per team member.
 * Each member's Mega forme is used if it holds its Mega Stone.
 * @returns {{ members: string[], rows: {type, multipliers: number[], weak: number, resist: number, immune: number}[] }}
 */
export function teamDefense(team, dataset) {
  const resolved = team.map(set => resolveForme(set, dataset));
  const members = resolved.map(r => r.label);
  const profiles = resolved.map(r => defensiveProfile(r.types, dataset.typechart, r.ability));
  const rows = Object.keys(dataset.typechart).map(type => {
    const multipliers = profiles.map(p => p[type]);
    return {
      type,
      multipliers,
      weak: multipliers.filter(m => m > 1).length,
      resist: multipliers.filter(m => m > 0 && m < 1).length,
      immune: multipliers.filter(m => m === 0).length,
    };
  });
  return { members, rows };
}

/**
 * Offensive coverage: for each of your Pokémon and each opponent, the best type multiplier
 * among your damaging moves (and which move gives it). Ignores the opponent's ability.
 * @returns {{ attacker: string, defender: string, best: number, move: string | null }[]}
 */
export function teamCoverage(team, opponents, dataset) {
  const out = [];
  for (const set of team) {
    const attacks = set.moves.map(m => dataset.getMove(m)).filter(m => m && m.category !== 'Status');
    for (const opp of opponents) {
      const def = resolveForme(opp, dataset);
      let best = attacks.length ? 0 : null;
      let move = null;
      for (const m of attacks) {
        const e = effectiveness(m.type, def.types, dataset.typechart);
        if (e > best) { best = e; move = m.name; }
      }
      out.push({ attacker: set.name || set.species, defender: def.label, best, move });
    }
  }
  return out;
}

function resolveForme(set, dataset) {
  const megaName = set.state?.mega === false ? null : dataset.megaFormeFor(set.species, set.item);
  const species = dataset.getPokemon(megaName ?? set.species);
  if (!species) throw new Error(`Unknown Pokémon: ${set.species}`);
  const ability = megaName ? Object.values(species.abilities)[0] : set.ability;
  return { label: set.name || species.name, types: species.types, ability };
}
