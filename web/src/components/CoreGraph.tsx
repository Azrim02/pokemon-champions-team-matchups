import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as RPointerEvent } from 'react';
import { defensiveCores } from '../core';
import type { Dataset, DefenseMatrix, DefensiveCore, PokemonSet } from '../types';
import { battleForme } from '../lib/format';
import { useForceGraph, type Link, type Point } from '../lib/useForceGraph';
import { Sprite } from './Sprite';
import { TypeBadge } from './TypeBadge';

const MAX_CORES = 6;
const clampZoom = (z: number) => Math.max(0.5, Math.min(2.5, z));

type Focus = { kind: 'node'; i: number } | { kind: 'core'; i: number } | null;

const Types = ({ list }: { list: string[] }) => <span className="type-list">{list.map(t => <TypeBadge key={t} type={t} />)}</span>;

export function CoreGraph({ matrix, myTeam, dataset }: { matrix: DefenseMatrix; myTeam: PokemonSet[]; dataset: Dataset }) {
  const { weaknesses, links, cores } = useMemo(() => defensiveCores(matrix), [matrix]);
  const names = matrix.members;
  const shown = cores.slice(0, MAX_CORES);

  // One edge per pair; mutual when each covers something for the other.
  const edges = useMemo(() => {
    const byPair = new Map<string, Link & { aCovers: boolean; bCovers: boolean }>();
    for (const l of links) {
      const a = Math.min(l.of, l.by), b = Math.max(l.of, l.by);
      const e = byPair.get(`${a}-${b}`) ?? { a, b, weight: 0, aCovers: false, bCovers: false };
      e.weight += l.types.length;
      if (l.by === a) e.aCovers = true; else e.bCovers = true;
      byPair.set(`${a}-${b}`, e);
    }
    return [...byPair.values()];
  }, [links]);
  const keys = useMemo(() => names.map((m, i) => `${m}#${names.slice(0, i).filter(x => x === m).length}`), [names]);

  const frame = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const graph = useForceGraph(keys, edges, size);

  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const zoomBy = (f: number) => setView(v => ({ ...v, zoom: clampZoom(v.zoom * f) }));
  // Ctrl/⌘ + wheel (and trackpad pinch) zooms; a plain wheel still scrolls the page.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setView(v => ({ ...v, zoom: clampZoom(v.zoom * Math.exp(-e.deltaY / 300)) }));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const [focus, setFocus] = useState<Focus>(null);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => { setFocus(null); setHover(null); }, [matrix]);
  const active: Focus = hover != null && focus?.kind !== 'core' ? { kind: 'node', i: hover } : focus;
  const core: DefensiveCore | undefined = active?.kind === 'core' ? cores[active.i] : undefined;
  const lit = (i: number) => !active || (core
    ? core.members.includes(i)
    : active.i === i || edges.some(e => (e.a === i && e.b === active.i) || (e.b === i && e.a === active.i)));
  const edgeLit = (e: Link) => !active || (core
    ? core.members.includes(e.a) && core.members.includes(e.b)
    : e.a === active.i || e.b === active.i);

  const toWorld = (e: RPointerEvent): Point => {
    const r = frame.current!.getBoundingClientRect();
    return {
      x: (e.clientX - r.left - r.width / 2 - view.x) / view.zoom,
      y: (e.clientY - r.top - r.height / 2 - view.y) / view.zoom,
    };
  };
  const drag = useRef<{ i: number | null; x: number; y: number; from: Point; moved: boolean } | null>(null);
  const start = (i: number | null) => (e: RPointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { i, x: e.clientX, y: e.clientY, from: { x: view.x, y: view.y }, moved: false };
  };
  const move = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    e.stopPropagation();
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return;
    d.moved = true;
    if (d.i != null) graph.hold(d.i, toWorld(e));
    else setView(v => ({ ...v, x: d.from.x + e.clientX - d.x, y: d.from.y + e.clientY - d.y }));
  };
  const end = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    e.stopPropagation();
    if (d.i != null && d.moved) graph.release();
    if (d.i == null && !d.moved) setFocus(null);
    // Kept until the click that follows, so a drag doesn't also select the node.
    drag.current = d.moved && d.i != null ? d : null;
    if (drag.current) setTimeout(() => { if (drag.current === d) drag.current = null; });
  };
  const handlers = (i: number | null) => ({
    onPointerDown: start(i), onPointerMove: (e: RPointerEvent) => { if (e.buttons) move(e); }, onPointerUp: end, onPointerCancel: end,
  });

  const node = active?.kind === 'node' ? active.i : null;
  const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };

  return (
    <section className="cores">
      <p className="legend">
        Lines join members that cover each other's weaknesses; thicker means more types. A dashed
        arrow points to the member being covered. Drag a Pokémon to move it, drag the background to pan.
      </p>
      <div className="cores-grid">
        <div className="graph" ref={frame} {...handlers(null)}>
          <div className="world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
            <svg aria-hidden="true">
              <defs>
                <marker id="core-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
                  <path d="M0 0L8 4L0 8z" />
                </marker>
              </defs>
              {edges.map(e => {
                const mutual = e.aCovers && e.bCovers;
                // One-way edges run from the member that covers to the one it covers.
                const p = graph.points[e.aCovers ? e.a : e.b], q = graph.points[e.aCovers ? e.b : e.a];
                if (!p || !q) return null;
                const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
                const back = mutual ? 0 : Math.min(34, d / 2);
                return (
                  <line key={`${e.a}-${e.b}`} x1={p.x} y1={p.y}
                    x2={q.x - ((q.x - p.x) / d) * back} y2={q.y - ((q.y - p.y) / d) * back}
                    className={`${mutual ? 'mutual' : 'one-way'} ${edgeLit(e) ? (active ? 'lit' : '') : 'dim'}`}
                    strokeWidth={1 + Math.min(e.weight, 8) * 0.45} markerEnd={mutual ? undefined : 'url(#core-arrow)'} />
                );
              })}
            </svg>
            {names.map((m, i) => {
              const p = graph.points[i];
              if (!p || !myTeam[i]) return null;
              return (
                <button key={keys[i]} type="button" className={`node ${lit(i) ? '' : 'dim'}`}
                  aria-pressed={focus?.kind === 'node' && focus.i === i}
                  style={{ transform: `translate(${p.x}px, ${p.y}px) translate(-50%, -28px)` }}
                  {...handlers(i)}
                  onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(i); }} onPointerLeave={() => setHover(null)}
                  onClick={() => { if (!drag.current?.moved) setFocus(f => (f?.kind === 'node' && f.i === i ? null : { kind: 'node', i })); }}
                  onKeyDown={e => { const a = ARROWS[e.key]; if (a) { e.preventDefault(); graph.nudge(i, ...a); } }}>
                  <span className="disc"><Sprite species={battleForme(myTeam[i], dataset)} dataset={dataset} size={48} /></span>
                  <span className="node-name">{m}</span>
                </button>
              );
            })}
          </div>
          <div className="graph-tools" onPointerDown={e => e.stopPropagation()}>
            <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.25)}>+</button>
            <button type="button" aria-label="Zoom out" onClick={() => zoomBy(0.8)}>−</button>
            <button type="button" onClick={() => { setView({ x: 0, y: 0, zoom: 1 }); graph.reset(); }}>Reset</button>
          </div>
        </div>

        <div className="cores-side">
          {node != null && (
            <div className="node-detail" aria-live="polite">
              <h3>{names[node]}</h3>
              <p className="small">Weak to <Types list={weaknesses[node] ?? []} /></p>
              {links.some(l => l.of === node) && <>
                <p className="muted small">Covered by</p>
                <ul>{links.filter(l => l.of === node).map(l => <li key={l.by}>{names[l.by]} <Types list={l.types} /></li>)}</ul>
              </>}
              {links.some(l => l.by === node) && <>
                <p className="muted small">Covers</p>
                <ul>{links.filter(l => l.by === node).map(l => <li key={l.of}>{names[l.of]} <Types list={l.types} /></li>)}</ul>
              </>}
            </div>
          )}
          <div>
            <h3>Cores</h3>
            {shown.length ? (
              <ul className="core-list">
                {shown.map((c, i) => (
                  <li key={c.members.join('-')}>
                    <button type="button" aria-pressed={focus?.kind === 'core' && focus.i === i}
                      onClick={() => setFocus(f => (f?.kind === 'core' && f.i === i ? null : { kind: 'core', i }))}>
                      <span className="core-mons">
                        {c.members.map(m => myTeam[m] && <Sprite key={m} species={battleForme(myTeam[m], dataset)} dataset={dataset} size={30} />)}
                        <span>{c.members.map(m => names[m]).join(' + ')}</span>
                      </span>
                      {c.holes.length
                        ? <span className="muted small">Not covered: {c.holes.map(h => `${h.type} (${names[h.member]})`).join(', ')}</span>
                        : <span className="ok">Every weakness covered</span>}
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="muted small">No pair or trio covers each other's weaknesses.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
