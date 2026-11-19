// Saved teams: every web/src/teams/*.txt (Showdown export format) shows up in the team picker.
// The first one alphabetically is the default team on a first visit. The picker shows the
// Showdown header's name (`=== [format] Name ===`, ignored by parseTeam) if the file starts with
// one, else a name made from the file name.
const files = import.meta.glob<string>('./teams/*.txt', { query: '?raw', import: 'default', eager: true });

export interface SavedTeam { id: string; name: string; text: string }

export const savedTeams: SavedTeam[] = Object.entries(files)
  .map(([path, text]) => {
    const id = path.replace(/^.*\/|\.txt$/g, '');
    const header = text.match(/^\s*===\s*(?:\[[^\]]*\]\s*)?(.*?)\s*===/)?.[1];
    const name = header || id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' / ');
    return { id, name, text };
  })
  .sort((a, b) => a.id.localeCompare(b.id));
