// Guessed Reg M-D opponents: usage teams with Dondozo + Tatsugiri, Heatran, Mega Heatran or Mega Tatsugiri added.
// Usage: node opp-md.mjs <source.json> <out.json>
import fs from 'node:fs';
const S = (species, item, ability, nature, ev, moves) => ({ name: '', species, item, ability, nature, gender: '',
  evs: Object.fromEntries(['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map((k, i) => [k, +ev.split('/')[i]])), moves: moves.split(',') });
const dozo = [S('Dondozo', 'Leftovers', 'Unaware', 'Adamant', '32/32/0/0/2/0', 'Wave Crash,Order Up,Earthquake,Protect'),
  S('Dondozo', 'Sitrus Berry', 'Unaware', 'Impish', '32/2/32/0/0/0', 'Wave Crash,Order Up,Body Press,Protect'),
  S('Dondozo', 'Leftovers', 'Unaware', 'Adamant', '2/32/0/0/0/32', 'Wave Crash,Order Up,Earthquake,Protect')];
const tatsu = S('Tatsugiri', 'Focus Sash', 'Commander', 'Timid', '2/0/0/32/0/32', 'Draco Meteor,Muddy Water,Icy Wind,Protect');
const mtatsu = S('Tatsugiri', 'Tatsugirinite', 'Storm Drain', 'Modest', '2/0/0/32/0/32', 'Draco Meteor,Muddy Water,Icy Wind,Protect');
const tran = S('Heatran', 'Shuca Berry', 'Flash Fire', 'Modest', '32/0/0/32/0/2', 'Heat Wave,Earth Power,Flash Cannon,Protect');
const mtran = S('Heatran', 'Heatranite', 'Flash Fire', 'Modest', '32/0/0/32/2/0', 'Heat Wave,Earth Power,Flash Cannon,Protect');
const mega = s => /ite( [XYZ])?$/.test(s.item) && s.item !== 'Eviolite';
const out = JSON.parse(fs.readFileSync(process.argv[2])).map((t, k) => {
  const add = [[dozo[k % 3], tatsu], [mtran], [tran], [dozo[(k + 1) % 3], tatsu], [mtatsu], [mtran], [], [tran], [dozo[k % 3], tatsu], []][k % 10];
  let keep = t.filter(s => !add.some(a => a.item === s.item));
  if (add.some(mega)) keep = keep.filter(s => !mega(s));
  keep = keep.slice(0, 6 - add.length);
  const team = [...add, ...keep];
  for (const s of t) if (team.length < 6 && !team.includes(s) && !team.some(x => x.item === s.item)) team.push(s);
  return team;
}).filter(t => t.length === 6);
fs.writeFileSync(process.argv[3], JSON.stringify(out));
console.log(out.length, 'teams');
