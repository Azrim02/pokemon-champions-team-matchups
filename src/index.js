// Shared matchup modules. Browser-safe ESM: no Node built-ins, no I/O.
export { createDataset, toId, SP_LIMITS, STAT_IDS } from './data.js';
export { parseTeam, exportTeam, validateTeam } from './team.js';
export { gen, toCalcPokemon, toField, calcMove, calcSetVsSet, calcMatchup } from './calc.js';
export { speedOf, speedTiers, compareSpeed } from './speed.js';
export { effectiveness, defensiveProfile, teamDefense, teamCoverage, ABILITY_TYPE_MODIFIERS } from './typeMatrix.js';
export { defensiveCores } from './cores.js';
export { parseSpread, likelySets, likelyTeam, topThreats } from './opponents.js';
export { WEATHER_ABILITIES, battleAbility, setterWeather, pairingWeather } from './weather.js';
