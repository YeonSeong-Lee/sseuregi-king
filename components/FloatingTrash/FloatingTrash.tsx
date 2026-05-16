'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { TRASH_ITEMS } from './items';

const PICKS = [0, 1, 2, 1, 0] as const;

const MIN_SIZE = 32;
const MAX_SIZE = 56;
const MIN_SPEED = 40;
const MAX_SPEED = 80;
const MAX_ROT_SPEED = 30;
const MAX_DT = 0.05;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function subscribeReducedMotion(cb: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

interface ItemState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  size: number;
}

export function FloatingTrash() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef = useRef<ItemState[]>([]);
  const rafRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);
  const boundsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    boundsRef.current = { w: rect.width, h: rect.height };

    stateRef.current = PICKS.map(() => {
      const size = rand(MIN_SIZE, MAX_SIZE);
      const speed = rand(MIN_SPEED, MAX_SPEED);
      const angle = rand(0, Math.PI * 2);
      return {
        x: rand(0, Math.max(0, rect.width - size)),
        y: rand(0, Math.max(0, rect.height - size)),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: rand(0, 360),
        rotSpeed: rand(-MAX_ROT_SPEED, MAX_ROT_SPEED),
        size,
      };
    });

    stateRef.current.forEach((s, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      el.style.width = `${s.size}px`;
      el.style.height = `${s.size}px`;
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.rot}deg)`;
      el.style.visibility = 'visible';
    });

    if (reducedMotion) return;

    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      const prev = prevTimeRef.current;
      prevTimeRef.current = now;
      const dt = prev === null ? 0 : Math.min((now - prev) / 1000, MAX_DT);
      const { w, h } = boundsRef.current;
      const items = stateRef.current;

      for (let i = 0; i < items.length; i++) {
        const s = items[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.x <= 0) {
          s.x = 0;
          s.vx = Math.abs(s.vx);
        } else if (s.x + s.size >= w) {
          s.x = w - s.size;
          s.vx = -Math.abs(s.vx);
        }
        if (s.y <= 0) {
          s.y = 0;
          s.vy = Math.abs(s.vy);
        } else if (s.y + s.size >= h) {
          s.y = h - s.size;
          s.vy = -Math.abs(s.vy);
        }
        s.rot += s.rotSpeed * dt;
        const el = itemRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.rot}deg)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const r = container.getBoundingClientRect();
      boundsRef.current = { w: r.width, h: r.height };
      stateRef.current.forEach((s) => {
        s.x = Math.min(Math.max(0, s.x), Math.max(0, r.width - s.size));
        s.y = Math.min(Math.max(0, s.y), Math.max(0, r.height - s.size));
      });
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        prevTimeRef.current = null;
      } else if (running && rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      prevTimeRef.current = null;
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {PICKS.map((idx, i) => {
        const Component = TRASH_ITEMS[idx].Component;
        return (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={[
              'absolute top-0 left-0 text-fg',
              reducedMotion ? 'animate-float' : '',
            ].join(' ')}
            style={{ willChange: 'transform', visibility: 'hidden' }}
          >
            <Component className="w-full h-full" />
          </div>
        );
      })}
    </div>
  );
}
