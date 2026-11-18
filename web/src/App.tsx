import { useEffect, useMemo, useState } from 'react';
import {
  createDataset, exportTeam, likelyTeam, parseTeam, teamCoverage, teamDefense, topThreats, validateTeam,
} from './core';
import { loadDex, loadUsage, usageFiles } from './data';
import { savedTeams } from './teams';
import type { Conditions, Dataset, DexJson, Meta, PokemonSet, UsageSummary } from './types';
import { useStored } from './lib/storage';
import { useCalcWorker } from './lib/useCalcWorker';
import { TeamPanel } from './components/TeamPanel';
import { ConditionsPanel, DEFAULT_CONDITIONS, type UiConditions } from './components/ConditionsPanel';
import { OpponentsPanel, type OppSettings } from './components/OpponentsPanel';
import { DamageMatrix } from './components/DamageMatrix';
import { SpeedTiers } from './components/SpeedTiers';
import { CoverageTable, DefenseTable } from './components/TypeTables';

const TABS = ['Damage', 'Speed', 'Defense', 'Coverage'] as const;
type Tab = (typeof TABS)[number];

/** A legal sample team: the most used Pokémon, skipping repeats of a species or item. */
function sampleTeam(usage: UsageSummary, dataset: Dataset): string {
  const picked: PokemonSet[] = [];
  const species = new Set<string>();
  const items = new Set<string>();
  for (const t of topThreats(usage, dataset, { n: 40 })) {
    const s = t.sets[0];
    const base = dataset.getPokemon(s.species)?.baseSpecies ?? s.species;
    if (species.has(base) || (s.item && items.has(s.item))) continue;
    species.add(base);
    if (s.item) items.add(s.item);
    picked.push({ ...s, usage: undefined });
    if (picked.length === 6) break;
  }
  return exportTeam(picked);
}

export function App() {
  const [dex, setDex] = useState<DexJson | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [teamText, setTeamText] = useStored('team', savedTeams[0]?.text ?? '');
  const [cond, setCond] = useStored<UiConditions>('conditions', DEFAULT_CONDITIONS);
  const [opp, setOpp] = useStored<OppSettings>('opponents', {
    mode: 'top', topN: 12, custom: '', usageKey: usageFiles[0]?.key ?? '',
  });
  const [tab, setTab] = useStored<Tab>('tab', 'Damage');

  useEffect(() => {
    loadDex().then(r => { setDex(r.dex); setMeta(r.meta); }).catch(e => setLoadError(String(e.message ?? e)));
  }, []);

  const usageFile = usageFiles.find(f => f.key === opp.usageKey) ?? usageFiles[0];
  useEffect(() => {
    if (!usageFile) return;
    let live = true;
    loadUsage(usageFile).then(u => live && setUsage(u)).catch(e => live && setLoadError(String(e.message ?? e)));
    return () => { live = false; };
  }, [usageFile]);

  const dataset = useMemo(() => (dex ? createDataset(dex) : null), [dex]);

  // No saved teams and nothing pasted: start from a usage sample rather than an empty page.
  useEffect(() => {
    if (dataset && usage && !teamText.trim()) setTeamText(sampleTeam(usage, dataset));
  }, [dataset, usage]);

  const parsed = useMemo(() => parseTeam(teamText), [teamText]);
  const problems = useMemo(() => (dataset ? validateTeam(parsed, dataset) : []), [parsed, dataset]);
  // Only calc sets the dataset knows; the problems list explains the rest.
  const myTeam = useMemo(
    () => (dataset ? parsed.filter(s => dataset.getPokemon(s.species)).slice(0, 6) : []),
    [parsed, dataset],
  );

  const { opponents, missing } = useMemo(() => {
    if (!dataset || !usage) return { opponents: [] as PokemonSet[], missing: [] as string[] };
    if (opp.mode === 'top') {
      return { opponents: topThreats(usage, dataset, { n: opp.topN }).map(t => t.sets[0]), missing: [] };
    }
    const names = opp.custom.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    const team = likelyTeam(names, usage, dataset);
    return {
      opponents: team.filter(t => t.sets.length).map(t => t.sets[0]),
      missing: team.filter(t => !t.sets.length).map(t => t.species),
    };
  }, [dataset, usage, opp.mode, opp.topN, opp.custom]);

  const conditions = useMemo<Conditions>(() => ({
    gameType: cond.gameType,
    weather: cond.weather || undefined,
    terrain: cond.terrain || undefined,
    isGravity: cond.isGravity,
    mySide: cond.mySide,
    oppSide: cond.oppSide,
  }), [cond]);

  const calc = useCalcWorker(dex, myTeam, opponents, conditions);
  const defense = useMemo(() => (dataset && myTeam.length ? teamDefense(myTeam, dataset) : null), [myTeam, dataset]);
  const coverage = useMemo(
    () => (dataset && myTeam.length && opponents.length ? teamCoverage(myTeam, opponents, dataset) : null),
    [myTeam, opponents, dataset],
  );

  if (loadError) return <main className="center"><p className="warn">Couldn't load data: {loadError}</p></main>;
  if (!dataset || !meta) return <main className="center"><p className="muted">Loading Regulation data…</p></main>;
  if (!usageFiles.length) {
    return <main className="center"><p className="warn">No usage summary in data/usage/. Run <code>npm run data:usage</code>.</p></main>;
  }

  const empty = !myTeam.length ? 'Paste a team to see matchups.' : !opponents.length ? 'No opponents selected.' : null;
  // Results lag inputs while the worker runs; only show them once they match the current grid.
  const fresh = calc.result && calc.result.grid.length === myTeam.length
    && (calc.result.grid[0]?.length ?? 0) === opponents.length ? calc.result : null;

  return (
    <div className="app">
      <header className="top">
        <h1>Champions Matchups</h1>
        <p className="muted small">
          Regulation {meta.regulation.id} · {meta.regulation.start} to {meta.regulation.end}
          {usage && <> · usage {usage.month}</>}
        </p>
      </header>

      <aside className="side">
        <TeamPanel text={teamText} onText={setTeamText} sets={parsed} problems={problems} dataset={dataset}
          teams={savedTeams}
          onLoad={id => {
            if (id === 'usage') { if (usage) setTeamText(sampleTeam(usage, dataset)); return; }
            const t = savedTeams.find(x => x.id === id);
            if (t) setTeamText(t.text);
          }} />
        <ConditionsPanel value={cond} onChange={setCond} />
        <OpponentsPanel value={opp} onChange={setOpp} usageFiles={usageFiles} usage={usage}
          opponents={opponents} missing={missing} dataset={dataset} />
      </aside>

      <main className="main">
        <nav className="tabs" role="tablist">
          {TABS.map(t => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>
          ))}
          <span className={`status ${calc.pending ? 'busy' : ''}`} aria-live="polite">
            {calc.pending ? 'Calculating…' : calc.error ? `Calc error: ${calc.error}` : ''}
          </span>
        </nav>

        {empty ? <p className="muted pad">{empty}</p> : (
          <div className={`view ${calc.pending ? 'stale' : ''}`}>
            {tab === 'Damage' && (fresh
              ? <DamageMatrix myTeam={myTeam} opponents={opponents} result={fresh} trickRoom={cond.trickRoom} dataset={dataset} />
              : <p className="muted pad">Calculating…</p>)}
            {tab === 'Speed' && (fresh
              ? <SpeedTiers myTeam={myTeam} opponents={opponents} result={fresh} trickRoom={cond.trickRoom} dataset={dataset} />
              : <p className="muted pad">Calculating…</p>)}
            {tab === 'Defense' && defense && <DefenseTable matrix={defense} myTeam={myTeam} dataset={dataset} />}
            {tab === 'Coverage' && coverage && <CoverageTable myTeam={myTeam} opponents={opponents} cells={coverage} dataset={dataset} />}
          </div>
        )}
      </main>
    </div>
  );
}
