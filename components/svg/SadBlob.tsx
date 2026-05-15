// components/svg/SadBlob.tsx
const STROKE = 'var(--mascot-stroke)';
const BODY = 'var(--mascot-bag)';
const DROP = 'var(--mascot-lens)';

interface SadBlobProps {
  className?: string;
}

export function SadBlob({ className }: SadBlobProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g
        fill="none"
        stroke={STROKE}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Antennae — two upright curls */}
        <path d="M 48 30 Q 44 18 50 12" />
        <path d="M 72 30 Q 76 18 70 12" />

        {/* Body — soft, slightly pear-shaped blob */}
        <path
          d="M 30 50 Q 28 36 44 32 Q 60 28 76 32 Q 92 36 90 52 Q 92 72 86 84 Q 78 96 60 96 Q 42 96 34 84 Q 28 72 30 50 Z"
          fill={BODY}
        />

        {/* Closed sad eyes — gentle downward arcs */}
        <path d="M 46 58 Q 50 62 54 58" />
        <path d="M 66 58 Q 70 62 74 58" />

        {/* Small frown */}
        <path d="M 54 76 Q 60 72 66 76" />

        {/* Stick arms hanging at the sides */}
        <path d="M 30 60 Q 22 68 24 78" />
        <path d="M 90 60 Q 98 68 96 78" />

        {/* Tiny dot hands */}
        <circle cx="24" cy="78" r="1.6" fill={STROKE} />
        <circle cx="96" cy="78" r="1.6" fill={STROKE} />

        {/* Sweat drop on forehead */}
        <path
          d="M 78 42 Q 76 46 78 49 Q 80 46 78 42 Z"
          fill={DROP}
          stroke={STROKE}
          strokeWidth="1.4"
        />
      </g>
    </svg>
  );
}
