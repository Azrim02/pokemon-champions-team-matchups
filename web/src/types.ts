// Shapes of the data the shared modules in src/ produce and consume (see src/README.md).

export type StatId = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';
export type Stats = Record<StatId, number>;

export interface SetState {
  boosts?: Partial<Stats>;
  status?: string;
  curHPPct?: number;
  abilityOn?: boolean;
  mega?: boolean;
  /** Overrides the side's alliesFainted for this set */
  alliesFainted?: number;
}

export interface SetUsage {
  seenAs: string;
  usagePct: number;
  itemPct: number | null;
  abilityPct: number | null;
  /** The ability it battles with (a Mega's own ability), which may differ from `ability` */
  battleAbility: string;
  battleAbilityPct: number | null;
  spreadPct: number | null;
  movePcts: number[];
}

export interface PokemonSet {
  name: string;
  species: string;
  item: string;
  ability: string;
  nature: string;
  gender: string;
  evs: Stats;
  moves: string[];
  state?: SetState;
  usage?: SetUsage;
}

export interface SideConditions {
  isTailwind?: boolean;
  isReflect?: boolean;
  isLightScreen?: boolean;
  isAuroraVeil?: boolean;
  isHelpingHand?: boolean;
  isFriendGuard?: boolean;
  /** Fainted Pokémon on this side: powers up Last Respects and Supreme Overlord */
  alliesFainted?: number;
}

export interface Conditions {
  gameType?: 'Doubles' | 'Singles';
  weather?: string;
  terrain?: string;
  isGravity?: boolean;
  /** Pairings involving a weather setter use the setter's weather (src/weather.js) instead of `weather` */
  autoWeather?: boolean;
  mySide?: SideConditions;
  oppSide?: SideConditions;
}

export interface MoveCalc {
  move: string;
  type: string;
  category: 'Physical' | 'Special' | 'Status';
  basePower: number;
  damage: [number, number] | null;
  percent: [number, number] | null;
  rolls: number[];
  koChance: string;
  desc: string;
  /** Only for moves that scale with fainted allies: the count used for this calc */
  alliesFainted?: number;
  /** Only for moves that scale with fainted allies: the damage at 0 to 3 of them */
  byFaints?: { alliesFainted: number; percent: [number, number] | null; koChance: string }[];
}

export interface Species {
  id: string;
  name: string;
  num: number;
  baseSpecies: string;
  forme: string | null;
  types: string[];
  baseStats: Stats;
  abilities: Record<string, string>;
  isMega: boolean;
  battleOnly: string | string[] | null;
}

export interface Item { id: string; name: string; category?: string }
export interface Move { id: string; name: string; type: string; category: string }

export type TypeChart = Record<string, Record<string, number>>;

export interface DexJson {
  pokemon: Species[];
  items: Item[];
  moves: Move[];
  abilities: { name: string }[];
  learnsets: Record<string, string[]>;
  typechart: TypeChart;
}

export interface Meta {
  regulation: { id: string; format: string; start: string; end: string };
  showdownFormat: string;
  showdownCommit: string;
}

export interface Dataset {
  raw: DexJson;
  typechart: TypeChart;
  types: string[];
  getPokemon(name: string): Species | null;
  getItem(name: string): Item | null;
  getMove(name: string): Move | null;
  getAbility(name: string): { name: string } | null;
  canLearn(species: string, move: string): boolean;
  megaFormeFor(species: string, item: string): string | null;
}

export interface Pct { id: string; pct: number }
export interface UsageEntry {
  id: string;
  name: string;
  usagePct: number;
  rawCount: number;
  abilities: Pct[];
  items: Pct[];
  moves: Pct[];
  spreads: { spread: string; pct: number }[];
  teammates: string[];
  checksAndCounters: { id: string; score: number; sd: number; n: number }[];
}

export interface UsageSummary {
  source: string;
  month: string;
  format: string;
  cutoff: number;
  battles: number;
  pokemon: UsageEntry[];
}

export interface Threat { species: string; usagePct: number; sets: PokemonSet[] }

export interface DefenseMatrix {
  members: string[];
  rows: { type: string; multipliers: number[]; weak: number; resist: number; immune: number }[];
}

export interface CoverageCell { attacker: string; defender: string; best: number | null; move: string | null }

// Worker protocol

export interface CalcRequest {
  type: 'calc';
  id: number;
  myTeam: PokemonSet[];
  opponents: PokemonSet[];
  conditions: Conditions;
}

export interface Pairing {
  myMoves: MoveCalc[];
  theirMoves: MoveCalc[];
  /** Set when "weather from setters" gave this pairing a weather other than the field's */
  setterWeather?: string;
  error?: string;
}

export interface CalcResult {
  /** grid[i][j]: my team member i against opponent j */
  grid: Pairing[][];
  /** Final Speed of each set, or null if it couldn't be calc'd */
  mySpeeds: (number | null)[];
  oppSpeeds: (number | null)[];
}

export type WorkerRequest = { type: 'init'; dex: DexJson } | CalcRequest;
export type WorkerResponse =
  | { type: 'ready' }
  | ({ type: 'result'; id: number } & CalcResult)
  | { type: 'error'; id: number; message: string };
