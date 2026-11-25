import type { Dataset, PlayGuide as Guide, PokemonSet } from '../types';
import { battleForme } from '../lib/format';
import { Sprite } from './Sprite';

const pct = (x: number) => `${Math.round(x * 100)}%`;
const pct1 = (x: number) => `${(x * 100).toFixed(1)}%`;

interface Props { found: { guide: Guide; changed: string[] } | null; sets: PokemonSet[]; dataset: Dataset }

export function PlayGuide({ found, sets, dataset }: Props) {
  if (!found) {
    return <p className="muted pad">No play guide for this team. Guides exist for teams tested in tools/doubles-sim; load one of those in the Team tab.</p>;
  }
  const { guide: g, changed } = found;
  const mon = (name: string, size = 30) => {
    const set = sets.find(s => s.species === name);
    return <Sprite species={set ? battleForme(set, dataset) : name} dataset={dataset} size={size} />;
  };
  const Pair = ({ names }: { names: string[] }) => (
    <span className="play-pair">{names.map(x => <span key={x} className="who">{mon(x)}{x}</span>)}</span>
  );
  return (
    <div className="play">
      <p className="legend">
        From {g.games.toLocaleString()} simulated Doubles games against {g.opponents} Reg M-C teams, both sides played by the same AI.
        Win rates are for comparing choices, not a ladder forecast: the AI picks leads to suit the opponent, so a lead's win rate also reflects when it was picked.
      </p>
      {changed.length > 0 && (
        <p className="warn small">Your {changed.join(', ')} {changed.length === 1 ? 'differs' : 'differ'} from the tested sets, so these numbers may not match.</p>
      )}
      <ul className="play-stats">
        <li><strong>{pct1(g.overall.usage.win)}</strong> <span className="muted small">± {pct1(g.overall.usage.se)} against usage teams</span></li>
        <li><strong>{pct1(g.overall.archetypes.win)}</strong> <span className="muted small">± {pct1(g.overall.archetypes.se)} against archetypes</span></li>
      </ul>

      <div className="play-cols">
        <section className="panel">
          <h3>Game plan</h3>
          <ul className="play-text">{g.plan.map(x => <li key={x}>{x}</li>)}</ul>
        </section>
        <section className="panel">
          <h3>Watch out for</h3>
          <ul className="play-text">{g.cautions.map(x => <li key={x}>{x}</li>)}</ul>
        </section>
      </div>

      <h3>Jobs</h3>
      <ul className="set-cards">
        {g.mons.map(m => (
          <li key={m.species} className="set-card">
            <div className="set-head">
              {mon(m.species, 48)}
              <div>
                <span className="roster-name">{m.species}</span>
                <div className="muted small">Brought {pct(m.brought)} · led {pct(m.led)} · won {pct(m.won)}</div>
              </div>
            </div>
            <p className="small">{m.role}</p>
            <ul className="play-moves">
              {m.moves.map(x => (
                <li key={x.move}><span>{x.move}</span><span className="bar"><span style={{ width: pct(x.share) }} /></span><span className="num muted">{pct(x.share)}</span></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="play-cols">
        <section>
          <h3>Leads</h3>
          <div className="scroll">
            <table className="matrix play-table">
              <thead><tr><th scope="col">Lead</th><th scope="col">Games</th><th scope="col">Won</th></tr></thead>
              <tbody>{g.leads.map(l => <tr key={l.pair.join()}><th scope="row"><Pair names={l.pair} /></th><td className="num">{l.games}</td><td className="num">{pct(l.win)}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
        <section>
          <h3>Most used fours</h3>
          <div className="scroll">
            <table className="matrix play-table">
              <thead><tr><th scope="col">Lead</th><th scope="col">Back</th><th scope="col">Games</th><th scope="col">Won</th></tr></thead>
              <tbody>{g.fours.map(f => <tr key={f.lead.join() + f.back.join()}><th scope="row"><Pair names={f.lead} /></th><td><Pair names={f.back} /></td><td className="num">{f.games}</td><td className="num">{pct(f.win)}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>

      <h3>Most common turn 1 moves</h3>
      <ul className="play-chips">{g.turn1.map(t => <li key={t.mon + t.move}>{mon(t.mon, 26)} {t.move} <span className="muted small">{t.games}×</span></li>)}</ul>

      <h3>By archetype</h3>
      <ul className="play-arch">
        {g.archetypes.map(a => (
          <li key={a.name} className="panel">
            <div className="play-arch-head"><strong>{a.name}</strong><span className={a.win >= 0.6 ? 'ok' : a.win < 0.5 ? 'warn' : 'muted'}>{pct(a.win)} of {a.games} games</span></div>
            <p className="small">{a.note}</p>
            {a.leads.length > 0 && <div className="muted small">Usual leads: {a.leads.map(l => `${l.pair.join(' + ')} (${l.games})`).join(', ')}</div>}
          </li>
        ))}
      </ul>

      <div className="play-cols">
        <section>
          <h3>Hardest opponents</h3>
          <ul className="play-text">{g.hardest.map((h, i) => <li key={i}><strong>{pct(h.win)}</strong> {h.team.join(', ')}</li>)}</ul>
        </section>
        {g.sample && (
          <section>
            <h3>Sample win</h3>
            <p className="small muted">{g.sample.kind}: {g.sample.opponent.join(', ')}</p>
            {g.sample.turns.map(t => (
              <details key={t.turn} open={t.turn <= 1}>
                <summary>{t.turn ? `Turn ${t.turn}` : 'Leads'}</summary>
                <ul className="play-text small">{t.steps.map((s, i) => <li key={i} className={s.startsWith('You') ? 'mine' : ''}>{s}</li>)}</ul>
              </details>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
