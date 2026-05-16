interface IconProps {
  className?: string;
}

export function SodaCan({ className }: IconProps) {
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
      <rect
        x="28"
        y="18"
        width="44"
        height="68"
        rx="6"
        fill="var(--mascot-lens)"
      />
      <ellipse cx="50" cy="18" rx="22" ry="5" fill="var(--mascot-bag)" />
      <ellipse cx="50" cy="86" rx="22" ry="5" fill="var(--mascot-bag)" />
      <rect
        x="32"
        y="40"
        width="36"
        height="20"
        fill="var(--mascot-bag)"
      />
      <path d="M44 14 L56 14" />
      <circle cx="50" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}
