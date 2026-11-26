import { useMemo } from 'react';
import { SP_LIMITS, likelyTeam, toId } from '../core';
import type { Dataset, PokemonSet, Species, StatId, UsageEntry, UsageSummary } from '../types';
import { battleForme } from '../lib/format';
import { NATURES, natureOf } from '../lib/natures';
import { Combobox, type ComboOption } from './Combobox';
import { Sprite } from './Sprite';
import { TypeBadge } from './TypeBadge';

const STATS = [['hp', 'HP'], ['atk', 'Atk'], ['def', 'Def'], ['spa', 'SpA'], ['spd', 'SpD'], ['spe', 'Spe']] as const;
const STAT_NAME = Object.fromEntries(STATS) as Record<StatId, string>;

/** Usage shares for one species, with its Mega formes' entries merged in (usage names Megas directly). */
export interface SpeciesUsage {
  pct: number;
  /** The usage entry to copy a full set from: the most used of the base forme and its Megas. */
  top: UsageEntry | null;
  items: Map<string, number>;
  moves: Map<string, number>;
  abilities: Map<string, number>;
}

export function speciesUsage(species: Species, usage: UsageSummary | null, dataset: Dataset): SpeciesUsage {
  const entries = (usage?.pokemon ?? []).filter(e => {
    const p = dataset.getPokemon(e.id);
    return p && (p.id === species.id || (p.isMega && p.baseSpecies === species.name));
  });
  const pct = entries.reduce((n, e) => n + e.usagePct, 0);
  const merge = (pick: (e: UsageEntry) => { id: string; pct: number }[], from = entries) => {
    const m = new Map<string, number>();
    const sum = from.reduce((n, e) => n + e.usagePct, 0);
    for (const e of from) for (const x of pick(e)) m.set(x.id, (m.get(x.id) ?? 0) + (x.pct * e.usagePct) / sum);
    return m;
  };
  return {
    pct,
    top: entries.reduce<UsageEntry | null>((a, e) => (!a || e.usagePct > a.usagePct ? e : a), null),
    items: merge(e => e.items), moves: merge(e => e.moves), // A Mega battles with its own ability, so only the base forme's entry says which one is registered.
    abilities: merge(e => e.abilities, entries.filter(e => e.id === species.id)),
  };
}

const share = (p: number | undefined) => (p && p >= 0.1 ? `${p < 10 ? p.toFixed(1) : Math.round(p)}%` : undefined);
/** Most used first, then A to Z. */
const byUsage = (u: Map<string, number>) => (a: { value: string; label: string }, b: { value: string; label: string }) =>
  (u.get(toId(b.value)) ?? 0) - (u.get(toId(a.value)) ?? 0) || a.label.localeCompare(b.label);

/** Species a team can register: no battle-only formes (Megas come from their stone). */
export function speciesOptions(dataset: Dataset, usage: UsageSummary | null): ComboOption[] {
  const pct = new Map<string, number>();
  for (const e of usage?.pokemon ?? []) {
    const p = dataset.getPokemon(e.id);
    const base = p?.isMega ? toId(p.baseSpecies) : e.id;
    pct.set(base, (pct.get(base) ?? 0) + e.usagePct);
  }
  return dataset.raw.pokemon
    .filter(p => !p.battleOnly && !p.isMega)
    .map(p => ({ value: p.name, label: p.name, hint: [share(pct.get(p.id)), p.types.join('/')].filter(Boolean).join(' · ') }))
    .sort(byUsage(pct));
}

/** A set for a newly picked species: keeps the old item, moves and spread where they still fit. */
export function changeSpecies(set: PokemonSet | null, name: string, dataset: Dataset, usage: UsageSummary | null): PokemonSet {
  const sp = dataset.getPokemon(name)!;
  const u = speciesUsage(sp, usage, dataset);
  const abilities = Object.values(sp.abilities);
  const ability = [...abilities].sort((a, b) => (u.abilities.get(toId(b)) ?? 0) - (u.abilities.get(toId(a)) ?? 0))[0] ?? '';
  const stone = set?.item && dataset.getItem(set.item);
  const keepItem = set?.item && !(stone && stone.category === 'mega-stone' && !dataset.megaFormeFor(sp.name, set.item));
  return {
    name: '', species: sp.name, gender: '', ability,
    item: keepItem ? set!.item : '',
    nature: set?.nature ?? '',
    evs: set?.evs ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    moves: (set?.moves ?? []).filter(m => dataset.canLearn(sp.id, m)),
  };
}

/** The most common usage set for a species (Megas come back as base forme + stone), or null. */
export function usageSet(name: string, dataset: Dataset, usage: UsageSummary | null): PokemonSet | null {
  const sp = dataset.getPokemon(name);
  const top = sp && usage && speciesUsage(sp, usage, dataset).top;
  if (!top) return null;
  const s = likelyTeam([top.name], usage, dataset)[0]?.sets[0];
  return s ? { ...s, name: '', usage: undefined, state: undefined } : null;
}

interface Props {
  set: PokemonSet;
  index: number;
  count: number;
  dataset: Dataset;
  usage: UsageSummary | null;
  species: ComboOption[];
  onChange(set: PokemonSet): void;
  onRemove(): void;
  onMove(step: -1 | 1): void;
}

export function SetEditor({ set, index, count, dataset, usage, species: speciesList, onChange, onRemove, onMove }: Props) {
  const sp = dataset.getPokemon(set.species);
  const forme = battleForme(set, dataset);
  const shown = dataset.getPokemon(forme) ?? sp;
  const u = useMemo(() => (sp ? speciesUsage(sp, usage, dataset) : null), [sp, usage, dataset]);

  const items = useMemo<ComboOption[]>(() => {
    if (!sp) return [];
    return dataset.raw.items
      // Mega Stones only for the species that can use them.
      .filter(i => i.category !== 'mega-stone' || dataset.megaFormeFor(sp.name, i.name))
      .map(i => ({ value: i.name, label: i.name, hint: share(u?.items.get(i.id)) }))
      .sort(byUsage(u?.items ?? new Map()));
  }, [sp, dataset, u]);

  const moves = useMemo<ComboOption[]>(() => {
    if (!sp) return [];
    return (dataset.raw.learnsets[sp.id] ?? [])
      .map(id => dataset.getMove(id)).filter(m => m != null)
      .map(m => {
        const mv = m as typeof m & { basePower?: number };
        const power = mv.category === 'Status' ? 'Status' : `${mv.category.slice(0, 4)} ${mv.basePower ?? ''}`.trim();
        return { value: m.name, label: m.name, hint: [share(u?.moves.get(m.id)), `${m.type} · ${power}`].filter(Boolean).join(' · ') };
      })
      .sort(byUsage(u?.moves ?? new Map()));
  }, [sp, dataset, u]);

  const total = STATS.reduce((n, [id]) => n + (set.evs?.[id] ?? 0), 0);
  const left = SP_LIMITS.total - total;
  const nature = natureOf(set.nature);
  const update = (patch: Partial<PokemonSet>) => onChange({ ...set, ...patch });
  const setSp = (stat: StatId, raw: number) => {
    const cur = set.evs?.[stat] ?? 0;
    // Only the per-stat cap is enforced here, so points can move between stats in any order;
    // the total shows red (and the legality check lists it) while it is over.
    const v = Math.max(0, Math.min(SP_LIMITS.perStat, Math.round(raw) || 0));
    if (v === cur) return;
    update({ evs: { ...set.evs, [stat]: v } });
  };
  const setMove = (i: number, name: string) => {
    const next = [...set.moves];
    if (name) next[i] = name; else next.splice(i, 1);
    update({ moves: next.filter(Boolean).filter((m, k, a) => a.findIndex(x => toId(x) === toId(m)) === k) });
  };
  const fromUsage = usageSet(set.species, dataset, usage);
  /** " (12%)" when the species has a real choice of ability; nothing when one ability takes ~all of it. */
  const abilityShare = (a: string) => {
    const p = u?.abilities.get(toId(a));
    return sp && Object.keys(sp.abilities).length > 1 && p && p >= 0.1 && p < 99.5 ? ` (${share(p)})` : '';
  };

  return (
    <li className="set-card set-editor">
      <div className="set-head">
        <Sprite species={forme} dataset={dataset} size={48} />
        <div className="grow">
          <Combobox label={`Pokémon ${index + 1}`} value={set.species} options={speciesList} placeholder="Search Pokémon"
            onChange={name => name && name !== set.species && onChange(changeSpecies(set, name, dataset, usage))} />
          <div className="muted small">
            {forme !== set.species && <span className="tag">{forme}</span>} {u && u.pct > 0 && `${share(u.pct) ?? '<0.1%'} usage`}
          </div>
        </div>
        <span className="types">{shown?.types.map(t => <TypeBadge key={t} type={t} />)}</span>
      </div>

      {!sp ? <p className="warn small">Not in the current data. Pick a Pokémon, or fix the name in the text.</p> : <>
        <div className="editor-row">
          <label className="field"><span>Item</span>
            <Combobox label="Item" value={set.item} options={items} clearable placeholder="Search items"
              onChange={item => update({ item })} />
          </label>
          <label className="field"><span>Ability</span>
            <select value={set.ability} onChange={e => update({ ability: e.target.value })}>
              {!Object.values(sp.abilities).includes(set.ability) && <option value={set.ability}>{set.ability || '—'}</option>}
              {Object.values(sp.abilities).map(a => (
                <option key={a} value={a}>
                  {a}{abilityShare(a)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="editor-moves">
          {[0, 1, 2, 3].map(i => (
            <Combobox key={i} label={`Move ${i + 1}`} value={set.moves[i] ?? ''} options={moves} clearable
              placeholder={i <= set.moves.length ? 'Search moves' : ''} onChange={m => setMove(Math.min(i, set.moves.length), m)} />
          ))}
        </div>

        <label className="field"><span>Nature</span>
          <select value={nature?.name ?? set.nature} onChange={e => update({ nature: e.target.value })}>
            {!nature && <option value={set.nature}>{set.nature || '—'}</option>}
            {NATURES.map(n => (
              <option key={n.name} value={n.name}>
                {n.name}{n.plus ? ` (+${STAT_NAME[n.plus]} −${STAT_NAME[n.minus!]})` : ''}
              </option>
            ))}
          </select>
        </label>

        <div className="sp-grid" role="group" aria-label="Stat Points">
          {STATS.map(([id, name]) => {
            const v = set.evs?.[id] ?? 0;
            const mark = nature?.plus === id ? 'plus' : nature?.minus === id ? 'minus' : '';
            return (
              <div key={id} className="sp-row">
                <span className={`sp-name ${mark}`}>{name}{mark === 'plus' ? '+' : mark === 'minus' ? '−' : ''}</span>
                <span className="muted sp-base" title="Base stat">{shown?.baseStats[id]}</span>
                <input type="range" min={0} max={SP_LIMITS.perStat} value={v} aria-label={`${name} Stat Points`}
                  onChange={e => setSp(id, Number(e.target.value))} />
                <input type="number" min={0} max={SP_LIMITS.perStat} value={v} aria-label={`${name} Stat Points value`}
                  onChange={e => setSp(id, Number(e.target.value))} />
              </div>
            );
          })}
          <p className={`small sp-left ${left < 0 ? 'warn' : 'muted'}`}>{total}/{SP_LIMITS.total} Stat Points · {left < 0 ? `${-left} over` : `${left} left`}</p>
        </div>
      </>}

      <div className="editor-actions">
        {fromUsage && <button type="button" className="link" onClick={() => onChange(fromUsage)}
          title="Replace this set with the most common usage set">Use usage set</button>}
        <span className="grow" />
        <button type="button" className="icon" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>↑</button>
        <button type="button" className="icon" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(1)}>↓</button>
        <button type="button" className="icon" aria-label={`Remove ${set.species}`} onClick={onRemove}>✕</button>
      </div>
    </li>
  );
}
