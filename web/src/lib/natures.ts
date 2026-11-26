import type { StatId } from '../types';

/** The 25 natures: the stat each raises and lowers (none for the five neutral ones). */
export const NATURES: { name: string; plus?: StatId; minus?: StatId }[] = [
  { name: 'Hardy' }, { name: 'Docile' }, { name: 'Serious' }, { name: 'Bashful' }, { name: 'Quirky' },
  { name: 'Lonely', plus: 'atk', minus: 'def' }, { name: 'Adamant', plus: 'atk', minus: 'spa' },
  { name: 'Naughty', plus: 'atk', minus: 'spd' }, { name: 'Brave', plus: 'atk', minus: 'spe' },
  { name: 'Bold', plus: 'def', minus: 'atk' }, { name: 'Impish', plus: 'def', minus: 'spa' },
  { name: 'Lax', plus: 'def', minus: 'spd' }, { name: 'Relaxed', plus: 'def', minus: 'spe' },
  { name: 'Modest', plus: 'spa', minus: 'atk' }, { name: 'Mild', plus: 'spa', minus: 'def' },
  { name: 'Rash', plus: 'spa', minus: 'spd' }, { name: 'Quiet', plus: 'spa', minus: 'spe' },
  { name: 'Calm', plus: 'spd', minus: 'atk' }, { name: 'Gentle', plus: 'spd', minus: 'def' },
  { name: 'Careful', plus: 'spd', minus: 'spa' }, { name: 'Sassy', plus: 'spd', minus: 'spe' },
  { name: 'Timid', plus: 'spe', minus: 'atk' }, { name: 'Hasty', plus: 'spe', minus: 'def' },
  { name: 'Jolly', plus: 'spe', minus: 'spa' }, { name: 'Naive', plus: 'spe', minus: 'spd' },
];

export const natureOf = (name: string) => NATURES.find(n => n.name.toLowerCase() === name.trim().toLowerCase());
