import { Fragment, useState } from 'react';
import type { CalcResult, Dataset, MoveCalc, PokemonSet } from '../types';
import { band, battleForme, bestMove, compareSpeed, label, pctRange } from '../lib/format';
import { Sprite } from './Sprite';
import { TypeBadge } from './TypeBadge';
import { PHONE, useMediaQuery } from '../lib/useMediaQuery';

interface Props {
  myTeam: PokemonSet[];
  opponents: PokemonSet[];
  result: CalcResult;
  trickRoom: boolean;
  dataset: Dataset;
}

const SPEED_MARK = { faster: '▲ faster', slower: '▼ slower', tie: '= tie' };

export function DamageMatrix(props: Props) {
  return useMediaQuery(PHONE) ? <DamageCards {...props} /> : <DamageGrid {...props} />;
}

const LEGEND = (
  <>
    <span className="swatch ko" /> guaranteed OHKO <span className="swatch heavy" /> 50%+ max roll <span className="swatch light" /> under 50%
  </>
);

/** Phone layout: pick one of your Pokémon, then one card per opponent. Tap a card for every move. */
function DamageCards({ myTeam, opponents, result, trickRoom, dataset }: Props) {
  const [pick, setPick] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const i = Math.min(pick, myTeam.length - 1);
  const me = myTeam[i];

  return (
    <div>
      <div className="mon-picker" role="tablist" aria-label="Your Pokémon">
        {myTeam.map((m, k) => (
          <button key={k} type="button" role="tab" aria-selected={k === i} onClick={() => { setPick(k); setOpen(null); }}>
            <Sprite species={battleForme(m, dataset)} dataset={dataset} size={44} />
            <span>{label(m, dataset)}</span>
          </button>
        ))}
      </div>
      <p className="legend">↗ your best move · ↘ theirs, by max roll. {LEGEND}</p>
      <ul className="dmg-cards">
        {opponents.map((o, j) => {
          const p = result.grid[i]?.[j];
          if (!p) return null;
          const mine = bestMove(p.myMoves);
          const theirs = bestMove(p.theirMoves);
          const a = result.mySpeeds[i], b = result.oppSpeeds[j];
          const spd = a != null && b != null ? compareSpeed(a, b, trickRoom) : null;
          const isOpen = open === j;
          return (
            <li key={j} className={isOpen ? 'open' : undefined}>
              <button type="button" className="dmg-card" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : j)}>
                <Sprite species={battleForme(o, dataset)} dataset={dataset} size={44} />
                <span className="dmg-name">
                  <strong>{label(o, dataset)}</strong>
                  {spd && <span className={`spd ${spd}`}>{SPEED_MARK[spd]}</span>}
                </span>
                {p.error ? <span className="warn small">{p.error}</span> : (
                  <span className="dmg-hits">
                    <span className={`hit out ${band(mine)}`}>{mine ? `${mine.move} ${pctRange(mine)}` : '—'}</span>
                    <span className={`hit in ${band(theirs)}`}>{theirs ? `${theirs.move} ${pctRange(theirs)}` : '—'}</span>
                  </span>
                )}
              </button>
              {isOpen && !p.error && (
                <div className="detail">
                  {p.setterWeather && <p className="muted small">In {p.setterWeather}, from a weather setter.</p>}
                  <MoveList title={`Your ${label(me, dataset)} → their ${label(o, dataset)}`} moves={p.myMoves} dir="out" />
                  <MoveList title={`Their ${label(o, dataset)} → your ${label(me, dataset)}`} moves={p.theirMoves} dir="in" />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DamageGrid({ myTeam, opponents, result, trickRoom, dataset }: Props) {
  const [sel, setSel] = useState<[number, number] | null>(null);
  const pair = sel && result.grid[sel[0]]?.[sel[1]];

  return (
    <div>
      <p className="legend">
        Each cell shows your best move into them (top) and their best move into you (bottom), by max roll.
        {LEGEND}
      </p>
      <div className="scroll">
        <table className="matrix damage">
          <thead>
            <tr>
              <th className="corner">You ↓ / Them →</th>
              {opponents.map((o, j) => (
                <th key={j} scope="col" className="col-head">
                  <Sprite species={battleForme(o, dataset)} dataset={dataset} />
                  <span>{label(o, dataset)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myTeam.map((m, i) => (
              <tr key={i}>
                <th scope="row"><span className="who"><Sprite species={battleForme(m, dataset)} dataset={dataset} />{label(m, dataset)}</span></th>
                {opponents.map((_, j) => {
                  const p = result.grid[i]?.[j];
                  if (!p) return <td key={j} />;
                  if (p.error) return <td key={j} className="err" title={p.error}>error</td>;
                  const mine = bestMove(p.myMoves);
                  const theirs = bestMove(p.theirMoves);
                  const a = result.mySpeeds[i], b = result.oppSpeeds[j];
                  const spd = a != null && b != null ? compareSpeed(a, b, trickRoom) : null;
                  const active = sel?.[0] === i && sel?.[1] === j;
                  return (
                    <td key={j} className={active ? 'active' : undefined}>
                      <button type="button" className="cell" onClick={() => setSel(active ? null : [i, j])}
                        aria-label={`${label(m, dataset)} vs ${label(opponents[j], dataset)}: details`}
                        title={p.setterWeather ? `In ${p.setterWeather} (weather setter)` : undefined}>
                        <span className={`hit out ${band(mine)}`}>{mine ? `${mine.move} ${pctRange(mine)}` : '—'}</span>
                        <span className={`hit in ${band(theirs)}`}>{theirs ? `${theirs.move} ${pctRange(theirs)}` : '—'}</span>
                        {spd && <span className={`spd ${spd}`}>{SPEED_MARK[spd]}</span>}
                        {p.setterWeather && <span className="spd">{p.setterWeather}</span>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && pair && (
        <div className="detail">
          {pair.setterWeather && <p className="muted small">In {pair.setterWeather}, from a weather setter.</p>}
          <MoveList title={`Your ${label(myTeam[sel[0]], dataset)} → their ${label(opponents[sel[1]], dataset)}`} moves={pair.myMoves} dir="out" />
          <MoveList title={`Their ${label(opponents[sel[1]], dataset)} → your ${label(myTeam[sel[0]], dataset)}`} moves={pair.theirMoves} dir="in" />
        </div>
      )}
    </div>
  );
}

function MoveList({ title, moves, dir }: { title: string; moves: MoveCalc[]; dir: 'out' | 'in' }) {
  return (
    <section className="moves">
      <h3>{title}</h3>
      <table>
        <tbody>
          {moves.map((m, k) => (
            <Fragment key={k}>
              <tr>
                <td><TypeBadge type={m.type} /></td>
                <td>{m.move}{m.byFaints && <span className="muted small"> ({m.basePower} BP)</span>}</td>
                <td className={`num hit ${dir} ${band(m)}`}>{m.category === 'Status' ? 'status' : pctRange(m)}</td>
                <td className="small">{m.koChance}</td>
              </tr>
              {m.byFaints && (
                <tr className="by-faints">
                  <td />
                  <td colSpan={3}>
                    <table aria-label={`${m.move} damage by fainted allies`}>
                      <thead><tr><th scope="row">Fainted</th>{m.byFaints.map(b => <th key={b.alliesFainted} scope="col">{b.alliesFainted}</th>)}</tr></thead>
                      <tbody>
                        <tr>
                          <th scope="row">Damage</th>
                          {m.byFaints.map(b => {
                            const row = { ...m, percent: b.percent };
                            return (
                              <td key={b.alliesFainted} title={b.koChance}
                                className={`num hit ${dir} ${band(row)}${b.alliesFainted === m.alliesFainted ? ' current' : ''}`}>
                                {pctRange(row)}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      <details className="small">
        <summary>Full calc text</summary>
        {moves.filter(m => m.desc).map((m, k) => <p key={k} className="desc">{m.desc}</p>)}
      </details>
    </section>
  );
}
