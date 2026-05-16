interface IconProps {
  className?: string;
}

export function Banana({ className }: IconProps) {
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
        d="M18 70 Q18 30 50 18 Q58 18 60 24 Q40 32 38 60 Q40 78 60 82 Q58 88 50 88 Q22 86 18 70 Z"
        fill="#f5d97a"
      />
      <path d="M56 18 L62 12" />
      <path d="M56 18 L66 18" />
      <path d="M30 60 Q36 50 50 46" />
    </svg>
  );
}
