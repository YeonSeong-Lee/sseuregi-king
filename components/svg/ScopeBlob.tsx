// components/svg/ScopeBlob.tsx
const STROKE = 'var(--mascot-stroke)';
const BODY = 'var(--mascot-bag)';
const SCOPE = 'var(--mascot-scope)';
const LENS = 'var(--mascot-lens)';
const EYEPIECE = 'var(--mascot-eyepiece)';

interface ScopeBlobProps {
  className?: string;
}

export function ScopeBlob({ className }: ScopeBlobProps) {
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
        {/* Antennae */}
        <path d="M 50 36 Q 44 22 48 8" strokeWidth="2.4" />
        <path d="M 70 36 Q 76 22 72 8" strokeWidth="2.4" />

        {/* Body */}
        <path
          d="M 28 52 Q 28 38 44 36 Q 60 34 76 36 Q 92 38 92 52 Q 94 70 88 82 Q 80 94 60 94 Q 40 94 32 82 Q 26 70 28 52 Z"
          fill={BODY}
          strokeWidth="2.6"
        />

        {/* Left eye — open dot */}
        <circle cx="50" cy="60" r="3.2" fill={STROKE} stroke="none" />

        {/* Right eye — behind the magnifying lens, enlarged */}
        <circle cx="74" cy="62" r="4.6" fill={EYEPIECE} stroke="none" />

        {/* Neutral mouth */}
        <path d="M 53 80 L 67 80" strokeWidth="2.2" />

        {/* Arms */}
        <path d="M 30 65 Q 22 74 24 84" strokeWidth="2.2" />
        <path d="M 90 65 Q 98 74 96 84" strokeWidth="2.2" />
        <circle cx="24" cy="84" r="1.6" fill={STROKE} stroke="none" />
        <circle cx="96" cy="84" r="1.6" fill={STROKE} stroke="none" />

        {/* Magnifying glass — lens over right eye + handle to upper right */}
        <circle cx="74" cy="62" r="10" fill={LENS} fillOpacity="0.35" stroke={SCOPE} strokeWidth="2.4" />
        <path d="M 82 54 L 92 44" stroke={SCOPE} strokeWidth="3" />
      </g>
    </svg>
  );
}
