'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { TRASH_ITEMS } from './items';

const PICKS = [0, 1, 2, 1, 0] as const;

const MIN_SIZE = 36;
const MAX_SIZE = 56;
const GRAVITY = 1400;
const MAX_FALL_SPEED = 900;
const BOUNCE_DAMPING = 0.72;
const MIN_BOUNCE_VY = 220;
const KICK_VY_MIN = 520;
const KICK_VY_MAX = 760;
const KICK_VX_RANGE = 90;
const SPAWN_VX_RANGE = 80;
const MAX_ROT_SPEED = 240;
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

    stateRef.current = PICKS.map((_, i) => {
      const size = rand(MIN_SIZE, MAX_SIZE);
      const slot = (i + 0.5) / PICKS.length;
      const xJitter = rand(-rect.width / (PICKS.length * 2), rect.width / (PICKS.length * 2));
      const x = Math.min(
        Math.max(0, slot * rect.width - size / 2 + xJitter),
        Math.max(0, rect.width - size),
      );
      return {
        x,
        y: Math.max(0, rect.height - size),
        vx: rand(-SPAWN_VX_RANGE, SPAWN_VX_RANGE),
        vy: -rand(KICK_VY_MIN, KICK_VY_MAX),
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
        s.vy = Math.min(s.vy + GRAVITY * dt, MAX_FALL_SPEED);
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        if (s.x <= 0) {
          s.x = 0;
          s.vx = Math.abs(s.vx);
        } else if (s.x + s.size >= w) {
          s.x = w - s.size;
          s.vx = -Math.abs(s.vx);
        }

        const floor = h - s.size;
        if (s.y >= floor && s.vy > 0) {
          s.y = floor;
          const bounced = s.vy * BOUNCE_DAMPING;
          if (bounced < MIN_BOUNCE_VY) {
            s.vy = -rand(KICK_VY_MIN, KICK_VY_MAX);
            s.vx += rand(-KICK_VX_RANGE, KICK_VX_RANGE);
            s.rotSpeed = rand(-MAX_ROT_SPEED, MAX_ROT_SPEED);
          } else {
            s.vy = -bounced;
          }
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
