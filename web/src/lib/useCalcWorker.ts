import { useEffect, useRef, useState } from 'react';
import type { CalcResult, Conditions, DexJson, PokemonSet, WorkerResponse } from '../types';

interface State { result: CalcResult | null; pending: boolean; error: string | null }

/**
 * Runs matchup calcs in a Web Worker. Inputs are debounced, and results from requests that a
 * newer one has superseded are dropped.
 */
export function useCalcWorker(
  dex: DexJson | null, myTeam: PokemonSet[], opponents: PokemonSet[], conditions: Conditions,
): State {
  const worker = useRef<Worker | null>(null);
  const latest = useRef(0);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>({ result: null, pending: false, error: null });

  useEffect(() => {
    if (!dex) return;
    const w = new Worker(new URL('../calc.worker.ts', import.meta.url), { type: 'module' });
    worker.current = w;
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'ready') { setReady(true); return; }
      if (msg.id !== latest.current) return;
      if (msg.type === 'error') setState(s => ({ ...s, pending: false, error: msg.message }));
      else setState({ result: { grid: msg.grid, mySpeeds: msg.mySpeeds, oppSpeeds: msg.oppSpeeds }, pending: false, error: null });
    };
    w.onerror = e => setState(s => ({ ...s, pending: false, error: e.message || 'Calc worker crashed' }));
    w.postMessage({ type: 'init', dex });
    return () => { w.terminate(); worker.current = null; setReady(false); };
  }, [dex]);

  useEffect(() => {
    if (!ready || !worker.current) return;
    const id = ++latest.current;
    setState(s => ({ ...s, pending: true }));
    const t = setTimeout(() => worker.current?.postMessage({ type: 'calc', id, myTeam, opponents, conditions }), 150);
    return () => clearTimeout(t);
  }, [ready, myTeam, opponents, conditions]);

  return state;
}
