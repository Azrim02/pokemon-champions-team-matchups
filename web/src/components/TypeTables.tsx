import type { CoverageCell, Dataset, DefenseMatrix, PokemonSet } from '../types';
import { battleForme, label, multiplier } from '../lib/format';
import { Sprite } from './Sprite';
import { TypeBadge } from './TypeBadge';

const effClass = (m: number | null) =>
  m == null ? '' : m === 0 ? 'immune' : m < 1 ? 'resist' : m > 1 ? 'weak' : 'neutral';

export function DefenseTable({ matrix, myTeam, dataset }: { matrix: DefenseMatrix; myTeam: PokemonSet[]; dataset: Dataset }) {
  return (
    <div>
      <p className="legend">
        Damage multiplier each attacking type does to each member, including type-based abilities
        (Levitate, Thick Fat…). Megas use their Mega forme.
      </p>
      <div className="scroll">
        <table className="matrix type-matrix">
          <thead>
            <tr>
              <th className="corner">Attacking type</th>
              {matrix.members.map((m, i) => (
                <th key={i} scope="col" className="col-head">
                  {myTeam[i] && <Sprite species={battleForme(myTeam[i], dataset)} dataset={dataset} />}
                  <span>{m}</span>
                </th>
              ))}
              <th scope="col">Weak</th><th scope="col">Resist</th><th scope="col">Immune</th>
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map(r => (
              <tr key={r.type} className={r.weak >= 3 && r.resist + r.immune === 0 ? 'flag' : undefined}>
                <th scope="row"><TypeBadge type={r.type} /></th>
                {r.multipliers.map((m, i) => <td key={i} className={`eff ${effClass(m)}`}>{multiplier(m)}</td>)}
                <td className="num">{r.weak || ''}</td>
                <td className="num">{r.resist || ''}</td>
                <td className="num">{r.immune || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CoverageTable({ myTeam, opponents, cells, dataset }: {
  myTeam: PokemonSet[]; opponents: PokemonSet[]; cells: CoverageCell[]; dataset: Dataset;
}) {
  const at = (i: number, j: number) => cells[i * opponents.length + j];
  const hits = opponents.map((_, j) => myTeam.filter((_, i) => (at(i, j)?.best ?? 0) > 1).length);
  return (
    <div>
      <p className="legend">
        Best type multiplier among each member's damaging moves (ignores the opponent's ability).
        The last row counts how many of your Pokémon hit that opponent super effectively.
      </p>
      <div className="scroll">
        <table className="matrix type-matrix">
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
                  const c = at(i, j);
                  const cls = c?.best == null ? '' : c.best > 1 ? 'weak' : c.best < 1 ? 'resist' : 'neutral';
                  return (
                    <td key={j} className={`eff ${cls}`} title={c?.move ?? 'No damaging moves'}>
                      {c?.best == null ? '—' : multiplier(c.best)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="totals">
              <th scope="row">Super effective</th>
              {hits.map((h, j) => <td key={j} className={`num ${h === 0 ? 'zero' : ''}`}>{h}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
