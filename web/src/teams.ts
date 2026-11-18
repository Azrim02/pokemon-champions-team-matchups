// Saved teams: every web/src/teams/*.txt (Showdown export format) shows up in the team picker.
// The first one alphabetically is the default team on a first visit.
const files = import.meta.glob<string>('./teams/*.txt', { query: '?raw', import: 'default', eager: true });

export interface SavedTeam { id: string; name: string; text: string }

export const savedTeams: SavedTeam[] = Object.entries(files)
  .map(([path, text]) => {
    const id = path.replace(/^.*\/|\.txt$/g, '');
    const name = id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' / ');
    return { id, name, text };
  })
  .sort((a, b) => a.id.localeCompare(b.id));
