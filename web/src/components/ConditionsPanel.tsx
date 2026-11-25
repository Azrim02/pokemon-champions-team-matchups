import type { SideConditions } from '../types';

export interface UiConditions {
  gameType: 'Doubles' | 'Singles';
  weather: string;
  autoWeather: boolean;
  terrain: string;
  isGravity: boolean;
  trickRoom: boolean;
  mySide: SideConditions;
  oppSide: SideConditions;
}

export const DEFAULT_CONDITIONS: UiConditions = {
  gameType: 'Doubles', weather: '', autoWeather: false, terrain: '', isGravity: false, trickRoom: false, mySide: {}, oppSide: {},
};

const WEATHER = ['Sun', 'Rain', 'Sand', 'Snow'];
const TERRAIN = ['Electric', 'Grassy', 'Psychic', 'Misty'];
/** A Doubles team brings 4 Pokémon, so up to 3 of its allies can faint. */
const FAINTS = [0, 1, 2, 3];
const SIDE_FLAGS: [Exclude<keyof SideConditions, 'alliesFainted'>, string][] = [
  ['isTailwind', 'Tailwind'],
  ['isReflect', 'Reflect'],
  ['isLightScreen', 'Light Screen'],
  ['isAuroraVeil', 'Aurora Veil'],
  ['isHelpingHand', 'Helping Hand'],
  ['isFriendGuard', 'Friend Guard'],
];

interface Props { value: UiConditions; onChange(c: UiConditions): void }

export function ConditionsPanel({ value, onChange }: Props) {
  const set = <K extends keyof UiConditions>(k: K, v: UiConditions[K]) => onChange({ ...value, [k]: v });
  const side = <K extends keyof SideConditions>(which: 'mySide' | 'oppSide', flag: K, v: SideConditions[K]) =>
    set(which, { ...value[which], [flag]: v });

  return (
    <section className="panel">
      <header className="panel-head"><h2>Field</h2></header>
      <div className="field-grid">
        <label>Format
          <select value={value.gameType} onChange={e => set('gameType', e.target.value as UiConditions['gameType'])}>
            <option>Doubles</option>
            <option>Singles</option>
          </select>
        </label>
        <label>Weather
          <select value={value.weather} onChange={e => set('weather', e.target.value)}>
            <option value="">None</option>
            {WEATHER.map(w => <option key={w}>{w}</option>)}
          </select>
        </label>
        <label>Terrain
          <select value={value.terrain} onChange={e => set('terrain', e.target.value)}>
            <option value="">None</option>
            {TERRAIN.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <div className="checks">
        <label title="A pairing with Charizard-Mega-Y, Pelipper or another weather setter is calc'd in that setter's weather. The weather above applies to the rest.">
          <input type="checkbox" checked={!!value.autoWeather} onChange={e => set('autoWeather', e.target.checked)} /> Weather from setters
        </label>
        <label><input type="checkbox" checked={value.trickRoom} onChange={e => set('trickRoom', e.target.checked)} /> Trick Room</label>
        <label><input type="checkbox" checked={value.isGravity} onChange={e => set('isGravity', e.target.checked)} /> Gravity</label>
      </div>
      <table className="side-table">
        <thead><tr><th /><th>Mine</th><th>Theirs</th></tr></thead>
        <tbody>
          {SIDE_FLAGS.map(([flag, name]) => (
            <tr key={flag}>
              <th scope="row">{name}</th>
              {(['mySide', 'oppSide'] as const).map(which => (
                <td key={which}>
                  <input
                    type="checkbox"
                    aria-label={`${name} (${which === 'mySide' ? 'my side' : 'their side'})`}
                    checked={!!value[which][flag]}
                    onChange={e => side(which, flag, e.target.checked)}
                  />
                </td>
              ))}
            </tr>
          ))}
          <tr title="Fainted Pokémon on that side. Last Respects gets 50 more base power per faint, and Supreme Overlord gets 10% more power per faint.">
            <th scope="row">Fainted</th>
            {(['mySide', 'oppSide'] as const).map(which => (
              <td key={which}>
                <select
                  aria-label={`Fainted Pokémon (${which === 'mySide' ? 'my side' : 'their side'})`}
                  value={value[which].alliesFainted ?? 0}
                  onChange={e => side(which, 'alliesFainted', Number(e.target.value))}
                >
                  {FAINTS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  );
}
