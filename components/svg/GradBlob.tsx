// components/svg/GradBlob.tsx
const STROKE = 'var(--mascot-stroke)';
const BODY = 'var(--mascot-bag)';
const CAP = 'var(--mascot-stroke)';

interface GradBlobProps {
  className?: string;
}

export function GradBlob({ className }: GradBlobProps) {
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
        {/* Body — soft blob */}
        <path
          d="M 30 56 Q 28 42 44 38 Q 60 34 76 38 Q 92 42 90 58 Q 92 78 86 90 Q 78 102 60 102 Q 42 102 34 90 Q 28 78 30 56 Z"
          fill={BODY}
        />

        {/* Eyes — small dots */}
        <circle cx="50" cy="64" r="2.2" fill={STROKE} stroke="none" />
        <circle cx="70" cy="64" r="2.2" fill={STROKE} stroke="none" />

        {/* Happy smile */}
        <path d="M 52 78 Q 60 84 68 78" />

        {/* Stick arms */}
        <path d="M 30 66 Q 22 74 24 84" />
        <path d="M 90 66 Q 98 74 96 84" />
        <circle cx="24" cy="84" r="1.6" fill={STROKE} />
        <circle cx="96" cy="84" r="1.6" fill={STROKE} />

        {/* Graduation cap — mortarboard */}
        <path
          d="M 38 28 L 60 18 L 82 28 L 60 38 Z"
          fill={CAP}
        />
        {/* Cap underside band */}
        <path
          d="M 48 32 L 60 38 L 72 32 L 72 40 Q 60 46 48 40 Z"
          fill={CAP}
        />
        {/* Tassel */}
        <path d="M 78 28 L 86 36" stroke={STROKE} strokeWidth="1.6" />
        <circle cx="86" cy="38" r="2.2" fill={STROKE} stroke="none" />
      </g>
    </svg>
  );
}
