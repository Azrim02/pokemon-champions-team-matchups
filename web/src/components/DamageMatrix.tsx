import { useState } from 'react';
import type { CalcResult, Dataset, MoveCalc, PokemonSet } from '../types';
import { band, battleForme, bestMove, compareSpeed, label, pctRange } from '../lib/format';
import { Sprite } from './Sprite';
import { TypeBadge } from './TypeBadge';

interface Props {
  myTeam: PokemonSet[];
  opponents: PokemonSet[];
  result: CalcResult;
  trickRoom: boolean;
  dataset: Dataset;
}

const SPEED_MARK = { faster: '▲ faster', slower: '▼ slower', tie: '= tie' };

export function DamageMatrix({ myTeam, opponents, result, trickRoom, dataset }: Props) {
  const [sel, setSel] = useState<[number, number] | null>(null);
  const pair = sel && result.grid[sel[0]]?.[sel[1]];

  return (
    <div>
      <p className="legend">
        Each cell shows your best move into them (top) and their best move into you (bottom), by max roll.
        <span className="swatch ko" /> guaranteed OHKO <span className="swatch heavy" /> 50%+ max roll <span className="swatch light" /> under 50%
      </p>
      <div className="scroll">
        <table className="matrix damage">
          <thead>
            <tr>
              <th className="corner">You ↓ / Them →</th>
              {opponents.map((o, j) => (
                <th key={j} scope="col" className="col-head">
                  <Sprite species={battleForme(o, dataset)} dataset={dataset} />
                  <span>{label(o)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myTeam.map((m, i) => (
              <tr key={i}>
                <th scope="row"><span className="who"><Sprite species={battleForme(m, dataset)} dataset={dataset} />{label(m)}</span></th>
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
                        aria-label={`${label(m)} vs ${label(opponents[j])}: details`}>
                        <span className={`hit out ${band(mine)}`}>{mine ? `${mine.move} ${pctRange(mine)}` : '—'}</span>
                        <span className={`hit in ${band(theirs)}`}>{theirs ? `${theirs.move} ${pctRange(theirs)}` : '—'}</span>
                        {spd && <span className={`spd ${spd}`}>{SPEED_MARK[spd]}</span>}
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
          <MoveList title={`Your ${label(myTeam[sel[0]])} → their ${label(opponents[sel[1]])}`} moves={pair.myMoves} dir="out" />
          <MoveList title={`Their ${label(opponents[sel[1]])} → your ${label(myTeam[sel[0]])}`} moves={pair.theirMoves} dir="in" />
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
            <tr key={k}>
              <td><TypeBadge type={m.type} /></td>
              <td>{m.move}</td>
              <td className={`num hit ${dir} ${band(m)}`}>{m.category === 'Status' ? 'status' : pctRange(m)}</td>
              <td className="small">{m.koChance}</td>
            </tr>
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
