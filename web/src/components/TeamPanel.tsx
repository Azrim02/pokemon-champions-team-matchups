import type { Dataset, PokemonSet } from '../types';
import { battleForme } from '../lib/format';
import { TypeBadge } from './TypeBadge';
import { Sprite } from './Sprite';
import type { SavedTeam } from '../teams';

interface Props {
  text: string;
  onText(text: string): void;
  sets: PokemonSet[];
  problems: string[];
  dataset: Dataset;
  teams: SavedTeam[];
  onLoad(id: string): void;
}

export function TeamPanel({ text, onText, sets, problems, dataset, teams, onLoad }: Props) {
  return (
    <section className="panel">
      <header className="panel-head">
        <h2>Your team</h2>
        <select aria-label="Load a team" value="" onChange={e => { if (e.target.value) onLoad(e.target.value); }}>
          <option value="">Load team…</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          <option value="usage">Top usage sample</option>
        </select>
      </header>
      <textarea
        className="paste"
        value={text}
        onChange={e => onText(e.target.value)}
        placeholder="Paste a Showdown / Pokepaste export (Stat Points on the EVs: or SPs: line)"
        spellCheck={false}
        rows={10}
      />
      {sets.length > 0 && (
        <ul className="roster">
          {sets.map((s, i) => {
            const forme = battleForme(s, dataset);
            const species = dataset.getPokemon(forme);
            return (
              <li key={i}>
                <Sprite species={forme} dataset={dataset} size={36} />
                <span className="roster-name">{s.name || s.species}</span>
                {forme !== s.species && <span className="tag">{forme}</span>}
                <span className="types">{species?.types.map(t => <TypeBadge key={t} type={t} />)}</span>
              </li>
            );
          })}
        </ul>
      )}
      {problems.length > 0 ? (
        <details className="problems" open={problems.length <= 3}>
          <summary>{problems.length} legality {problems.length === 1 ? 'issue' : 'issues'}</summary>
          <ul>{problems.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </details>
      ) : sets.length > 0 && <p className="ok">Legal for this regulation</p>}
    </section>
  );
}
