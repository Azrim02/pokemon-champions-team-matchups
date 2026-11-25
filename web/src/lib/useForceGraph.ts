import { useCallback, useEffect, useRef, useState } from 'react';

export interface Point { x: number; y: number }
export interface Link { a: number; b: number; weight: number }
interface Body extends Point { vx: number; vy: number }

const EDGE = 48; // keeps nodes inside the frame
const IDLE = 0.005; // the layout has settled below this energy

const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

function step(bodies: Body[], links: Link[], alpha: number, held: number | null, size: { w: number; h: number }) {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      const dx = b.x - a.x || 0.1, dy = b.y - a.y || 0.1;
      const d = Math.max(20, Math.hypot(dx, dy));
      const f = (26000 / (d * d)) * alpha;
      a.vx -= (dx / d) * f; a.vy -= (dy / d) * f;
      b.vx += (dx / d) * f; b.vy += (dy / d) * f;
    }
  }
  const reach = Math.min(size.w, size.h) * 0.55;
  for (const { a: i, b: j, weight } of links) {
    const a = bodies[i], b = bodies[j];
    if (!a || !b) continue;
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 1;
    // Members that cover more of each other sit closer together.
    const f = (d - reach * (1.1 - Math.min(weight, 8) * 0.06)) * 0.03 * alpha;
    a.vx += (dx / d) * f; a.vy += (dy / d) * f;
    b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
  }
  bodies.forEach((p, i) => {
    if (i === held) { p.vx = p.vy = 0; return; }
    p.vx = (p.vx - p.x * 0.02 * alpha) * 0.8;
    p.vy = (p.vy - p.y * 0.02 * alpha * Math.max(1, size.w / size.h)) * 0.8;
    p.x = clamp(p.x + p.vx, Math.max(0, size.w / 2 - EDGE));
    p.y = clamp(p.y + p.vy, Math.max(0, size.h / 2 - EDGE));
  });
}

/** A small force-directed layout. Positions are relative to the centre of the frame. */
export function useForceGraph(keys: string[], links: Link[], size: { w: number; h: number }) {
  const bodies = useRef<Body[]>([]);
  const prevKeys = useRef<string[]>([]);
  const alpha = useRef(0);
  const held = useRef<number | null>(null);
  const frame = useRef(0);
  const live = useRef({ links, size });
  live.current = { links, size };
  const [points, setPoints] = useState<Point[]>([]);
  const publish = () => setPoints(bodies.current.map(({ x, y }) => ({ x, y })));

  const run = useCallback((energy: number) => {
    alpha.current = Math.max(alpha.current, energy);
    const { links: l, size: s } = live.current;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (let i = 0; i < 300; i++) step(bodies.current, l, 1 - i / 300, held.current, s);
      alpha.current = 0;
      publish();
      return;
    }
    if (frame.current) return;
    const tick = () => {
      step(bodies.current, live.current.links, alpha.current, held.current, live.current.size);
      publish();
      if (held.current == null) alpha.current *= 0.985;
      frame.current = alpha.current > IDLE ? requestAnimationFrame(tick) : 0;
    };
    frame.current = requestAnimationFrame(tick);
  }, []);

  const place = useCallback((keep: boolean) => {
    const old = new Map(keep ? prevKeys.current.map((k, i) => [k, bodies.current[i]]) : []);
    const r = Math.min(live.current.size.w, live.current.size.h) * 0.32;
    bodies.current = keys.map((k, i) => {
      const t = (i / keys.length) * 2 * Math.PI - Math.PI / 2;
      return old.get(k) ?? { x: Math.cos(t) * r, y: Math.sin(t) * r, vx: 0, vy: 0 };
    });
    prevKeys.current = keys;
    publish();
    run(1);
  }, [keys, run]);

  const ready = size.w > 0;
  useEffect(() => { if (ready) place(true); }, [ready, place, links, size.w, size.h]);
  useEffect(() => () => { cancelAnimationFrame(frame.current); frame.current = 0; }, []);

  return {
    points,
    /** Holds node i at a position (while dragging). */
    hold(i: number, p: Point) {
      const b = bodies.current[i];
      if (!b) return;
      held.current = i;
      b.x = p.x; b.y = p.y;
      publish();
      run(0.5);
    },
    release() { held.current = null; run(0.3); },
    nudge(i: number, dx: number, dy: number) {
      const b = bodies.current[i];
      if (!b) return;
      b.x += dx; b.y += dy;
      publish();
      run(0.1);
    },
    reset: () => place(false),
  };
}
