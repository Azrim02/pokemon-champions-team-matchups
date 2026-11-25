import { SP_LIMITS } from '../core';
import type { Dataset, PokemonSet } from '../types';
import { battleForme } from '../lib/format';
import { TypeBadge } from './TypeBadge';
import { Sprite } from './Sprite';
import type { SavedTeam } from '../teams';

interface Props {
  text: string;
  onText(text: string): void;
  /** Whether the browser accepted the last save. */
  saved: boolean;
  sets: PokemonSet[];
  problems: string[];
  dataset: Dataset;
  teams: SavedTeam[];
  onLoad(id: string): void;
}

const STATS = [['hp', 'HP'], ['atk', 'Atk'], ['def', 'Def'], ['spa', 'SpA'], ['spd', 'SpD'], ['spe', 'Spe']] as const;

function SetCard({ set, dataset }: { set: PokemonSet; dataset: Dataset }) {
  const forme = battleForme(set, dataset);
  const species = dataset.getPokemon(forme);
  const spread = STATS.filter(([id]) => set.evs?.[id]).map(([id, name]) => `${set.evs[id]} ${name}`).join(' / ');
  const total = STATS.reduce((n, [id]) => n + (set.evs?.[id] ?? 0), 0);
  return (
    <li className="set-card">
      <div className="set-head">
        <Sprite species={forme} dataset={dataset} size={48} />
        <div>
          <span className="roster-name">{set.name || set.species}</span>
          {forme !== set.species && <> <span className="tag">{forme}</span></>}
          <div className="muted small">{[set.item, set.ability].filter(Boolean).join(' · ')}</div>
        </div>
        <span className="types">{species?.types.map(t => <TypeBadge key={t} type={t} />)}</span>
      </div>
      <div className="small">
        {set.nature && `${set.nature} · `}{spread || 'No Stat Points'}
        <span className="muted"> ({total}/{SP_LIMITS.total})</span>
      </div>
      <ul className="set-moves">{set.moves.map((m, i) => <li key={i}>{m}</li>)}</ul>
      {!species && <p className="warn small">Not in the current data, so it's left out of the matchups.</p>}
    </li>
  );
}

export function TeamPanel({ text, onText, saved, sets, problems, dataset, teams, onLoad }: Props) {
  return (
    <section className="builder">
      <div className="panel">
        <header className="panel-head">
          <h2>Team builder</h2>
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
          ? <p className="muted small note">Saved in this browser as you type.</p>
          : <p className="warn small note">This browser is blocking storage, so the team won't be here next time.</p>}
      </div>
      <div>
        {problems.length > 0 ? (
          <details className="problems" open={problems.length <= 3}>
            <summary>{problems.length} legality {problems.length === 1 ? 'issue' : 'issues'}</summary>
            <ul>{problems.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </details>
        ) : sets.length > 0 && <p className="ok">Legal for this regulation</p>}
        {sets.length > 0
          ? <ul className="set-cards">{sets.map((s, i) => <SetCard key={i} set={s} dataset={dataset} />)}</ul>
          : <p className="muted">Paste a team, or load one, to see it here.</p>}
      </div>
    </section>
  );
}
