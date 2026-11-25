import { readStored, writeStored } from './lib/storage';

// Saved teams: every web/src/teams/*.txt (Showdown export format) shows up in the team picker.
// DEFAULT_TEAM is the one shown on a first visit. The picker shows the
// Showdown header's name (`=== [format] Name ===`, ignored by parseTeam) if the file starts with
// one, else a name made from the file name.
const files = import.meta.glob<string>('./teams/*.txt', { query: '?raw', import: 'default', eager: true });

/** File name (without .txt) of the newest team: the one to start from. */
const DEFAULT_TEAM = 'metagross-rillaboom-regmd';

export interface SavedTeam { id: string; name: string; text: string }

export const savedTeams: SavedTeam[] = Object.entries(files)
  .map(([path, text]) => {
    const id = path.replace(/^.*\/|\.txt$/g, '');
    const header = text.match(/^\s*===\s*(?:\[[^\]]*\]\s*)?(.*?)\s*===/)?.[1];
    const name = header || id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' / ');
    return { id, name, text };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

export const defaultTeam: SavedTeam | undefined = savedTeams.find(t => t.id === DEFAULT_TEAM) ?? savedTeams[0];

/**
 * Moves a browser that still holds an unedited bundled team to a new default team, once per
 * default. Edited and pasted teams are never replaced. Call before the first render.
 */
export function adoptDefaultTeam() {
  if (!defaultTeam || readStored('teamDefault', '') === defaultTeam.id) return;
  const same = (a: string, b: string) => a.replace(/\r\n?/g, '\n').trim() === b.replace(/\r\n?/g, '\n').trim();
  const stored = readStored<string | null>('team', null);
  if (stored != null && savedTeams.some(t => same(t.text, stored))) writeStored('team', defaultTeam.text);
  writeStored('teamDefault', defaultTeam.id);
}
