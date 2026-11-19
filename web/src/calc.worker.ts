// Runs the damage calc and Speed calcs off the main thread. A full matchup is roughly
// 6 × N opponents × 8 moves calcs of 16 rolls each, which is too slow to redo on every keystroke.
import { createDataset } from '../../src/data.js';
import { calcSetVsSet } from '../../src/calc.js';
import { speedOf } from '../../src/speed.js';
import { pairingWeather, setterWeather } from '../../src/weather.js';
import type {
  CalcRequest, CalcResult, Conditions, Dataset, DexJson, MoveCalc, PokemonSet, SideConditions,
  WorkerRequest, WorkerResponse,
} from './types';

const calcMoves = calcSetVsSet as unknown as (
  a: PokemonSet, b: PokemonSet, d: Dataset, c: Conditions, o?: { reverse?: boolean },
) => MoveCalc[];
const speed = speedOf as unknown as (
  s: PokemonSet, d: Dataset, c: { weather?: string; terrain?: string; side?: SideConditions },
) => number;

const ctx = self as unknown as {
  postMessage(msg: WorkerResponse): void;
  onmessage: ((e: MessageEvent<WorkerRequest>) => void) | null;
};

let dataset: Dataset | null = null;

const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

const weatherOf = setterWeather as unknown as (s: PokemonSet, d: Dataset) => string | null;
const weatherFor = pairingWeather as unknown as
  (a: PokemonSet, b: PokemonSet, d: Dataset, fallback: string | null) => string | null;

function run({ myTeam, opponents, conditions: { autoWeather, ...conditions } }: CalcRequest, d: Dataset): CalcResult {
  // One pairing failing (e.g. a species the calc doesn't know) shouldn't blank the whole grid.
  const grid = myTeam.map(mine => opponents.map(theirs => {
    try {
      // Opponent first, so a Speed tie between two setters goes to the opponent's weather.
      const w = autoWeather ? weatherFor(theirs, mine, d, conditions.weather ?? null) ?? undefined : conditions.weather;
      const c = { ...conditions, weather: w };
      return {
        myMoves: calcMoves(mine, theirs, d, c),
        theirMoves: calcMoves(theirs, mine, d, c, { reverse: true }),
        ...(w !== conditions.weather && w ? { setterWeather: w } : {}),
      };
    } catch (err) {
      return { myMoves: [], theirMoves: [], error: message(err) };
    }
  }));
  // Speed is per set, not per pairing: with weather from setters, a setter is timed in its own weather.
  const speeds = (sets: PokemonSet[], side: SideConditions = {}) => sets.map(s => {
    try {
      const weather = (autoWeather && weatherOf(s, d)) || conditions.weather;
      return speed(s, d, { weather, terrain: conditions.terrain, side });
    } catch { return null; }
  });
  return { grid, mySpeeds: speeds(myTeam, conditions.mySide), oppSpeeds: speeds(opponents, conditions.oppSide) };
}

ctx.onmessage = e => {
  const msg = e.data;
  if (msg.type === 'init') {
    dataset = (createDataset as unknown as (j: DexJson) => Dataset)(msg.dex);
    ctx.postMessage({ type: 'ready' });
    return;
  }
  if (!dataset) {
    ctx.postMessage({ type: 'error', id: msg.id, message: 'Worker not initialised' });
    return;
  }
  try {
    ctx.postMessage({ type: 'result', id: msg.id, ...run(msg, dataset) });
  } catch (err) {
    ctx.postMessage({ type: 'error', id: msg.id, message: message(err) });
  }
};
