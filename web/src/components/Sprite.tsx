import { useMemo, useState } from 'react';
import { toId } from '../core';
import type { Dataset } from '../types';

// Pokémon Showdown's sprite server, gen5 style. It covers every M-C species except 11
// Champions-new Megas (e.g. Raichu-Mega-X), which fall back to their base species' sprite.
const SPRITES = 'https://play.pokemonshowdown.com/sprites/gen5';

/** Showdown's sprite ID rule: baseSpecies, plus "-forme" for non-base formes ("charizard-megay"). */
function spriteIds(species: string, dataset: Dataset): string[] {
  const sp = dataset.getPokemon(species);
  if (!sp) return [];
  const base = toId(sp.baseSpecies);
  return sp.name !== sp.baseSpecies && sp.forme ? [`${base}-${toId(sp.forme)}`, base] : [base];
}

interface Props { species: string; dataset: Dataset; size?: number }

/** Sprite for a species (pass the battle forme to show Megas). Renders a blank box if none loads. */
export function Sprite(props: Props) {
  // Keyed on species so the fallback index resets when the species changes.
  return <SpriteImg key={props.species} {...props} />;
}

function SpriteImg({ species, dataset, size = 40 }: Props) {
  const ids = useMemo(() => spriteIds(species, dataset), [species, dataset]);
  const [i, setI] = useState(0);
  const style = { width: size, height: size };
  if (i >= ids.length) return <span className="sprite missing" style={style} aria-hidden="true" />;
  return (
    <img
      className={`sprite ${i > 0 ? 'fallback' : ''}`}
      src={`${SPRITES}/${ids[i]}.png`}
      style={style}
      alt=""
      title={i > 0 ? `${species} (no sprite yet; showing the base forme)` : species}
      loading="lazy"
      decoding="async"
      onError={() => setI(i + 1)}
    />
  );
}
