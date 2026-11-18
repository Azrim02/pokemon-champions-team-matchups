// Loads the exported dataset and usage summaries straight from data/. They're emitted as static
// assets (not bundled into the JS), so the page shell loads fast and the browser caches the JSON.
import pokemonUrl from '../../data/pokemon.json?url';
import itemsUrl from '../../data/items.json?url';
import movesUrl from '../../data/moves.json?url';
import abilitiesUrl from '../../data/abilities.json?url';
import learnsetsUrl from '../../data/learnsets.json?url';
import typechartUrl from '../../data/typechart.json?url';
import metaUrl from '../../data/meta.json?url';
import type { DexJson, Meta, UsageSummary } from './types';

// Every usage summary in data/usage/<month>/. The raw Smogon files (~19 MB) are excluded.
const usageUrls = import.meta.glob<string>(
  ['../../data/usage/*/*.json', '!../../data/usage/**/*.raw.json'],
  { query: '?url', import: 'default', eager: true },
);

export interface UsageFile { key: string; month: string; name: string; url: string }

/** Newest month first. */
export const usageFiles: UsageFile[] = Object.entries(usageUrls)
  .map(([path, url]) => {
    const [, month, name] = path.match(/usage\/([^/]+)\/(.+)\.json$/) ?? [];
    return { key: `${month}/${name}`, month, name, url };
  })
  .sort((a, b) => b.key.localeCompare(a.key));

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} loading ${url}`);
  return res.json() as Promise<T>;
}

export async function loadDex(): Promise<{ dex: DexJson; meta: Meta }> {
  const [pokemon, items, moves, abilities, learnsets, typechart, meta] = await Promise.all([
    getJson<DexJson['pokemon']>(pokemonUrl),
    getJson<DexJson['items']>(itemsUrl),
    getJson<DexJson['moves']>(movesUrl),
    getJson<DexJson['abilities']>(abilitiesUrl),
    getJson<DexJson['learnsets']>(learnsetsUrl),
    getJson<DexJson['typechart']>(typechartUrl),
    getJson<Meta>(metaUrl),
  ]);
  return { dex: { pokemon, items, moves, abilities, learnsets, typechart }, meta };
}

export const loadUsage = (file: UsageFile) => getJson<UsageSummary>(file.url);
