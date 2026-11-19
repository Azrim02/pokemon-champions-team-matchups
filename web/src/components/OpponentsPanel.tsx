import type { UsageFile } from '../data';
import type { Dataset, PokemonSet, UsageSummary } from '../types';
import { battleForme } from '../lib/format';
import { Sprite } from './Sprite';

export interface OppSettings { mode: 'top' | 'custom'; topN: number; custom: string; usageKey: string }

interface Props {
  value: OppSettings;
  onChange(v: OppSettings): void;
  usageFiles: UsageFile[];
  usage: UsageSummary | null;
  opponents: PokemonSet[];
  missing: string[];
  dataset: Dataset;
}

const pct = (n: number | null | undefined) => (n == null ? '' : ` ${n}%`);

export function OpponentsPanel({ value, onChange, usageFiles, usage, opponents, missing, dataset }: Props) {
  const set = <K extends keyof OppSettings>(k: K, v: OppSettings[K]) => onChange({ ...value, [k]: v });

  return (
    <section className="panel">
      <header className="panel-head"><h2>Opponents</h2></header>
      <label className="block">Usage stats
        <select value={value.usageKey} onChange={e => set('usageKey', e.target.value)}>
          {usageFiles.map(f => <option key={f.key} value={f.key}>{f.month} · {f.name}</option>)}
        </select>
      </label>
      {usage && <p className="muted small">{usage.battles?.toLocaleString()} battles, rating ≥ {usage.cutoff}</p>}

      <div className="segmented" role="radiogroup" aria-label="Opponent source">
        <button type="button" role="radio" aria-checked={value.mode === 'top'} onClick={() => set('mode', 'top')}>Top threats</button>
        <button type="button" role="radio" aria-checked={value.mode === 'custom'} onClick={() => set('mode', 'custom')}>Team preview</button>
      </div>

      {value.mode === 'top' ? (
        <label className="block">Top
          <input type="number" min={1} max={60} value={value.topN}
            onChange={e => set('topN', Math.max(1, Math.min(60, Number(e.target.value) || 1)))} />
          by usage
        </label>
      ) : (
        <label className="block">Pokémon you see at team preview
          <textarea rows={3} value={value.custom} spellCheck={false}
            placeholder="Sneasler, Incineroar, Charizard-Mega-Y…"
            onChange={e => set('custom', e.target.value)} />
        </label>
      )}
      {missing.length > 0 && <p className="warn small">No usage data for {missing.join(', ')}</p>}

      <details className="opp-sets">
        <summary>Assumed sets ({opponents.length})</summary>
        <p className="muted small">Each field is its most common choice, picked separately; usage doesn't record whole sets.</p>
        <ul>
          {opponents.map((s, i) => (
            <li key={i}>
              <Sprite species={battleForme(s, dataset)} dataset={dataset} size={36} />
              <div>
              <strong>{battleForme(s, dataset)}</strong>{s.usage && <span className="muted">{pct(s.usage.usagePct)}</span>}
              <div className="small">
                {s.item || 'No item'}<span className="muted">{pct(s.usage?.itemPct)}</span> · {s.usage?.battleAbility ?? s.ability}<span className="muted">{pct(s.usage ? s.usage.battleAbilityPct : null)}</span>
              </div>
              <div className="small muted">
                {s.nature} {Object.values(s.evs).join('/')}{pct(s.usage?.spreadPct)}
              </div>
              <div className="small">{s.moves.join(' · ')}</div>
              </div>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
