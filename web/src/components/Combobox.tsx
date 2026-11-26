import { useId, useMemo, useRef, useState } from 'react';
import { toId } from '../core';

export interface ComboOption {
  value: string;
  label: string;
  /** Short text on the right, e.g. a usage share or a move's type and power. */
  hint?: string;
}

interface Props {
  value: string;
  options: ComboOption[];
  onChange(value: string): void;
  label: string;
  placeholder?: string;
  /** Adds a "(none)" option that sets the value to ''. */
  clearable?: boolean;
  className?: string;
}

const MAX_SHOWN = 80;

/**
 * Search box with a dropdown list. Typing filters by name (word starts rank first); arrow keys move,
 * Enter picks, Escape cancels. Options keep their given order otherwise (callers sort by usage).
 */
export function Combobox({ value, options, onChange, label, placeholder, clearable, className }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const shown = useMemo(() => {
    const q = toId(query);
    const all = clearable ? [{ value: '', label: '(none)' }, ...options] : options;
    if (!q) return all.slice(0, MAX_SHOWN);
    const starts: ComboOption[] = [], words: ComboOption[] = [], inside: ComboOption[] = [];
    for (const o of all) {
      if (!o.value) continue;
      const id = toId(o.label);
      if (id.startsWith(q)) starts.push(o);
      else if (o.label.split(/[\s-]+/).some(w => toId(w).startsWith(q))) words.push(o);
      else if (id.includes(q)) inside.push(o);
    }
    return [...starts, ...words, ...inside].slice(0, MAX_SHOWN);
  }, [query, options, clearable]);

  const current = options.find(o => o.value === value)?.label ?? value;

  function pick(o: ComboOption | undefined) {
    if (o) onChange(o.value);
    setOpen(false);
    setQuery('');
  }

  function move(step: number) {
    const next = Math.max(0, Math.min(shown.length - 1, active + step));
    setActive(next);
    listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
  }

  return (
    <div className={`combo ${className ?? ''}`}>
      <input
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && shown[active] ? `${listId}-${active}` : undefined}
        value={open ? query : current}
        placeholder={open ? current || placeholder : placeholder}
        spellCheck={false}
        autoComplete="off"
        onFocus={e => { setOpen(true); setQuery(''); setActive(0); e.target.select(); }}
        onBlur={() => { setOpen(false); setQuery(''); }}
        onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else move(1); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
          else if (e.key === 'Enter') { if (open) { e.preventDefault(); pick(shown[active]); } }
          else if (e.key === 'Escape') { setOpen(false); setQuery(''); (e.target as HTMLInputElement).blur(); }
        }}
      />
      {open && (
        <ul className="combo-list" id={listId} role="listbox" ref={listRef}
          // Keep focus in the input so a click picks before blur closes the list.
          onMouseDown={e => e.preventDefault()}>
          {shown.length === 0 && <li className="muted combo-empty">No match</li>}
          {shown.map((o, i) => (
            <li key={o.value || '(none)'} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              className={o.value === value ? 'current' : undefined}
              onMouseEnter={() => setActive(i)} onClick={() => pick(o)}>
              <span>{o.label}</span>{o.hint && <span className="muted combo-hint">{o.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
