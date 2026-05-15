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
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Antennae — tall ears rising from the top of the head with a slight outward curl */}
        <path d="M 50 36 Q 44 22 48 8" strokeWidth="2.4" />
        <path d="M 70 36 Q 76 22 72 8" strokeWidth="2.4" />

        {/* Body — rounded-square, slightly wider than tall */}
        <path
          d="M 28 52 Q 28 38 44 36 Q 60 34 76 36 Q 92 38 92 52 Q 94 70 88 82 Q 80 94 60 94 Q 40 94 32 82 Q 26 70 28 52 Z"
          fill={BODY}
          strokeWidth="2.6"
        />

        {/* Eyes — open black dots */}
        <circle cx="50" cy="60" r="3.2" fill={STROKE} stroke="none" />
        <circle cx="70" cy="60" r="3.2" fill={STROKE} stroke="none" />

        {/* Mouth — gentle frown (control point above start/end → curve dips upward) */}
        <path d="M 52 80 Q 60 72 68 80" strokeWidth="2.2" />

        {/* Stick arms hanging at the sides */}
        <path d="M 30 65 Q 22 74 24 84" strokeWidth="2.2" />
        <path d="M 90 65 Q 98 74 96 84" strokeWidth="2.2" />

        {/* Tiny dot hands */}
        <circle cx="24" cy="84" r="1.6" fill={STROKE} stroke="none" />
        <circle cx="96" cy="84" r="1.6" fill={STROKE} stroke="none" />

        {/* Sweat drop — right side of the head, lower than v1 */}
        <path
          d="M 84 50 Q 81 56 84 60 Q 87 56 84 50 Z"
          fill={DROP}
          strokeWidth="1.4"
        />
      </g>
    </svg>
  );
}
