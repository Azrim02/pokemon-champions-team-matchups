import { useMemo } from 'react';
import { exportTeam } from '../core';
import type { Dataset, PokemonSet, UsageSummary } from '../types';
import type { SavedTeam } from '../teams';
import { Combobox } from './Combobox';
import { SetEditor, changeSpecies, speciesOptions, usageSet } from './SetEditor';

interface Props {
  text: string;
  onText(text: string): void;
  /** Whether the browser accepted the last save. */
  saved: boolean;
  sets: PokemonSet[];
  problems: string[];
  dataset: Dataset;
  usage: UsageSummary | null;
  teams: SavedTeam[];
  onLoad(id: string): void;
}

/** The Showdown teambuilder header line ("=== [format] Name ==="), kept when the form rewrites the text. */
const headerOf = (text: string) => text.match(/^\s*(===.*===)[ \t]*(?:\n|$)/)?.[1];

export function TeamPanel({ text, onText, saved, sets, problems, dataset, usage, teams, onLoad }: Props) {
  const all = useMemo(() => speciesOptions(dataset, usage), [dataset, usage]);
  // Species Clause: flag the species already on the team (any forme counts).
  const onTeam = new Set(sets.map(s => dataset.getPokemon(s.species)?.baseSpecies));
  const species = useMemo(() => all.map(o => (onTeam.has(dataset.getPokemon(o.value)?.baseSpecies)
    ? { ...o, hint: `on team · ${o.hint ?? ''}` } : o)), [all, [...onTeam].join()]);
  // The text stays the source of truth: every form edit writes the whole team back as Showdown text.
  const commit = (next: PokemonSet[]) => {
    const head = headerOf(text);
    onText((head ? `${head}\n\n` : '') + exportTeam(next));
  };
  const replace = (i: number, s: PokemonSet) => commit(sets.map((x, k) => (k === i ? s : x)));
  const moveSet = (i: number, step: number) => {
    const next = [...sets];
    [next[i], next[i + step]] = [next[i + step], next[i]];
    commit(next);
  };
  const add = (name: string) => {
    if (!name) return;
    commit([...sets, usageSet(name, dataset, usage) ?? changeSpecies(null, name, dataset, usage)]);
  };

  return (
    <section className="builder">
      <div className="panel">
        <header className="panel-head">
          <h2>Team text</h2>
          <select aria-label="Load a team" value="" onChange={e => { if (e.target.value) onLoad(e.target.value); }}>
            <option value="">Load team…</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            <option value="usage">Top usage sample</option>
          </select>
        </header>
        <textarea
          className="paste"
          aria-label="Team text"
          value={text}
          onChange={e => onText(e.target.value)}
          placeholder="Paste a Showdown / Pokepaste export (Stat Points on the EVs: or SPs: line)"
          spellCheck={false}
          rows={28}
        />
        {saved
          ? <p className="muted small note">Saved in this browser as you type. The form and the text edit the same team.</p>
          : <p className="warn small note">This browser is blocking storage, so the team won't be here next time.</p>}
      </div>
      <div>
        {problems.length > 0 ? (
          <details className="problems" open={problems.length <= 3}>
            <summary>{problems.length} legality {problems.length === 1 ? 'issue' : 'issues'}</summary>
            <ul>{problems.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </details>
        ) : sets.length > 0 && <p className="ok">Legal for this regulation</p>}
        <ul className="set-cards">
          {sets.map((s, i) => (
            <SetEditor key={i} set={s} index={i} count={sets.length} dataset={dataset} usage={usage} species={species}
              onChange={x => replace(i, x)} onRemove={() => commit(sets.filter((_, k) => k !== i))}
              onMove={step => moveSet(i, step)} />
          ))}
          {sets.length < 6 && (
            <li className="set-card add-slot">
              <span className="muted small">Add Pokémon {sets.length + 1} of 6</span>
              <Combobox label="Add a Pokémon" value="" options={species} placeholder="Search Pokémon" onChange={add} />
              <span className="muted small">Starts from its most common usage set.</span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
