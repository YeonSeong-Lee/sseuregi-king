// components/SpeechBubble.tsx
import type { ReactNode } from 'react';

// TODO: migrate the home-page tagline bubble at app/[locale]/scan/page.tsx
// to this primitive in a follow-up.

interface SpeechBubbleProps {
  children: ReactNode;
  tail?: 'down' | 'up' | 'none';
  size?: 'sm' | 'md';
  shape?: 'pill' | 'card';
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<SpeechBubbleProps['size']>, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-5 py-2 text-sm',
};

const SHAPE_CLASS: Record<NonNullable<SpeechBubbleProps['shape']>, string> = {
  pill: 'inline-flex items-center justify-center rounded-full',
  card: 'block rounded-2xl leading-snug',
};

export function SpeechBubble({
  children,
  tail = 'none',
  size = 'md',
  shape = 'pill',
  className = '',
}: SpeechBubbleProps) {
  return (
    <div
      className={`relative border-2 border-fg font-[family-name:var(--font-fraunces)] font-semibold text-fg ${SHAPE_CLASS[shape]} ${SIZE_CLASS[size]} ${className}`}
      style={{ background: 'var(--mascot-bag)' }}
    >
      {tail === 'up' && (
        <span
          aria-hidden="true"
          data-testid="speech-bubble-tail"
          data-tail="up"
          className="absolute left-1/2 -translate-x-1/2 -top-[7px] w-3 h-3 border-l-2 border-t-2 border-fg rotate-45"
          style={{ background: 'var(--mascot-bag)' }}
        />
      )}
      {tail === 'down' && (
        <span
          aria-hidden="true"
          data-testid="speech-bubble-tail"
          data-tail="down"
          className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 border-r-2 border-b-2 border-fg rotate-45"
          style={{ background: 'var(--mascot-bag)' }}
        />
      )}
      {children}
    </div>
  );
}
