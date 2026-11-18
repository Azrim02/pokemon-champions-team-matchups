// Typed views of the shared src/ modules. The main thread only imports the modules that don't
// depend on @smogon/calc; calc.js and speed.js are used by the worker (see calc.worker.ts).
import * as data from '../../src/data.js';
import * as team from '../../src/team.js';
import * as typeMatrix from '../../src/typeMatrix.js';
import * as opponents from '../../src/opponents.js';
import type {
  CoverageCell, Dataset, DefenseMatrix, DexJson, PokemonSet, Threat, UsageSummary,
} from './types';

interface OppOptions { n?: number; spreads?: number }

export const createDataset = data.createDataset as unknown as (json: DexJson) => Dataset;
export const toId = data.toId as (s: unknown) => string;
export const SP_LIMITS = data.SP_LIMITS as { perStat: number; total: number };

export const parseTeam = team.parseTeam as unknown as (text: string) => PokemonSet[];
export const exportTeam = team.exportTeam as unknown as (sets: PokemonSet[]) => string;
export const validateTeam = team.validateTeam as unknown as (sets: PokemonSet[], d: Dataset) => string[];

export const teamDefense = typeMatrix.teamDefense as unknown as (t: PokemonSet[], d: Dataset) => DefenseMatrix;
export const teamCoverage = typeMatrix.teamCoverage as unknown as
  (t: PokemonSet[], opp: PokemonSet[], d: Dataset) => CoverageCell[];

export const topThreats = opponents.topThreats as unknown as
  (u: UsageSummary, d: Dataset, o?: OppOptions) => Threat[];
export const likelyTeam = opponents.likelyTeam as unknown as
  (names: string[], u: UsageSummary, d: Dataset, o?: OppOptions) => { species: string; sets: PokemonSet[] }[];
