interface IconProps {
  className?: string;
}

export function CoffeeCup({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M28 30 L72 30 L66 88 Q66 92 62 92 L38 92 Q34 92 34 88 Z"
        fill="var(--mascot-bag)"
      />
      <ellipse cx="50" cy="30" rx="22" ry="6" fill="var(--mascot-bag)" />
      <rect
        x="32"
        y="50"
        width="36"
        height="14"
        rx="3"
        fill="var(--mascot-cheek)"
      />
      <path d="M44 14 Q40 22 44 28" />
      <path d="M56 12 Q52 22 56 28" />
    </svg>
  );
}
