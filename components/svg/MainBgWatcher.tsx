// components/svg/MainBgWatcher.tsx
'use client';
import { useEffect, useRef } from 'react';

const STROKE = '#0f172a';
const PIVOT_X = 68;
const PIVOT_Y = 62;
const VIEWBOX = 120;
const DEFAULT_ANGLE = -50;

interface MainBgWatcherProps {
  className?: string;
}

export function MainBgWatcher({ className }: MainBgWatcherProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const scopeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      const svg = svgRef.current;
      const scope = scopeRef.current;
      if (!svg || !scope) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0) return;
      const scale = rect.width / VIEWBOX;
      const pivotX = rect.left + PIVOT_X * scale;
      const pivotY = rect.top + PIVOT_Y * scale;
      let deg = Math.atan2(e.clientY - pivotY, e.clientX - pivotX) * (180 / Math.PI);
      // Keep the telescope in the upper hemisphere so it never points through the bag body.
      if (deg > 0) deg = deg < 90 ? -1 : -179;
      scope.style.transform = `rotate(${deg}deg)`;
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g className="animate-float">
        {/* Bag body — pinched top, rounded bottom */}
        <path
          d="M 44 40 Q 38 48 32 58 Q 22 80 26 96 Q 30 110 50 110 Q 70 110 74 96 Q 78 80 68 58 Q 62 48 56 40 Z"
          fill="#f8fafc"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Tied knot at the top */}
        <path
          d="M 44 40 Q 46 30 50 36 Q 54 28 58 36 Q 60 30 56 40 Z"
          fill="#f8fafc"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Face — eyes look up toward the telescope */}
        <circle cx="42" cy="70" r="2" fill={STROKE} />
        <circle cx="56" cy="70" r="2" fill={STROKE} />
        <path
          d="M 42 78 Q 49 84 56 78"
          stroke={STROKE}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Subtle cheek blush */}
        <circle cx="36" cy="78" r="2" fill="#fecaca" opacity="0.85" />
        <circle cx="62" cy="78" r="2" fill="#fecaca" opacity="0.85" />

        {/* Hand gripping the eyepiece — also visual anchor for the rotation pivot */}
        <circle
          cx={PIVOT_X}
          cy={PIVOT_Y}
          r="3.5"
          fill="#f8fafc"
          stroke={STROKE}
          strokeWidth="2"
        />

        {/* Telescope — rotation driven by pointer position (default -50°) */}
        <g
          ref={scopeRef}
          style={{
            transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px`,
            transform: `rotate(${DEFAULT_ANGLE}deg)`,
            transition: 'transform 80ms linear',
          }}
        >
          {/* Barrel */}
          <rect
            x="68"
            y="58"
            width="38"
            height="8"
            rx="2"
            fill="#374151"
            stroke={STROKE}
            strokeWidth="2"
          />
          {/* Eyepiece (wider, near hand) */}
          <rect
            x="62"
            y="55"
            width="9"
            height="14"
            rx="1.5"
            fill="#1f2937"
            stroke={STROKE}
            strokeWidth="2"
          />
          {/* Objective housing (wider, at far end) */}
          <rect
            x="102"
            y="54"
            width="8"
            height="16"
            rx="1.5"
            fill="#1f2937"
            stroke={STROKE}
            strokeWidth="2"
          />
          {/* Lens glint */}
          <circle
            cx="106"
            cy="62"
            r="2.5"
            fill="#dbeafe"
            stroke={STROKE}
            strokeWidth="1.2"
          />
        </g>
      </g>
    </svg>
  );
}
