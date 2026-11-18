import type { CalcResult, Dataset, PokemonSet } from '../types';
import { battleForme, label } from '../lib/format';
import { Sprite } from './Sprite';

interface Props { myTeam: PokemonSet[]; opponents: PokemonSet[]; result: CalcResult; trickRoom: boolean; dataset: Dataset }

/** Move order, using the same tie-numbering as speedTiers() in src/speed.js. */
export function SpeedTiers({ myTeam, opponents, result, trickRoom, dataset }: Props) {
  const rows = [
    ...myTeam.map((s, i) => ({ label: label(s), forme: battleForme(s, dataset), group: 'mine', speed: result.mySpeeds[i] })),
    ...opponents.map((s, j) => ({ label: label(s), forme: battleForme(s, dataset), group: 'theirs', speed: result.oppSpeeds[j] })),
  ].filter((r): r is { label: string; forme: string; group: string; speed: number } => r.speed != null);
  rows.sort((a, b) => (trickRoom ? a.speed - b.speed : b.speed - a.speed) || a.label.localeCompare(b.label));
  const max = Math.max(1, ...rows.map(r => r.speed));
  let tier = 0;

  return (
    <div>
      <p className="legend">
        Final Speed after items, abilities, weather and Tailwind. {trickRoom ? 'Trick Room: slowest moves first.' : 'Fastest first.'}
        <span className="swatch mine" /> yours <span className="swatch theirs" /> theirs
      </p>
      <ol className="speed">
        {rows.map((r, i) => {
          if (i === 0 || r.speed !== rows[i - 1].speed) tier++;
          return (
            <li key={`${r.group}-${r.label}-${i}`} className={r.group}>
              <span className="tier">{tier}</span>
              <span className="name"><Sprite species={r.forme} dataset={dataset} size={32} />{r.label}</span>
              <span className="bar"><span style={{ width: `${(r.speed / max) * 100}%` }} /></span>
              <span className="num">{r.speed}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
