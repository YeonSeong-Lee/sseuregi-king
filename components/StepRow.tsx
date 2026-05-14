'use client';
import { useEffect, useState } from 'react';
import { StepIcon } from '@/components/svg/StepIcons';
import { getStepLabel } from '@/lib/disposal';
import type { Locale, StepId } from '@/types';

const CYCLE_MS = 1500;

interface StepRowProps {
  steps: StepId[];
  locale: Locale;
  interactive?: boolean;
}

export function StepRow({ steps, locale, interactive = true }: StepRowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);

  useEffect(() => {
    if (interactive && pinned !== null) return;
    const id = setInterval(() => {
      setActiveIndex(i => (i + 1) % steps.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [steps.length, pinned, interactive]);

  const shown = interactive ? (pinned ?? activeIndex) : activeIndex;

  return (
    <ol className="flex items-start gap-1 overflow-x-auto py-1 -mx-1 px-1 scrollbar-none">
      {steps.map((step, i) => {
        const isActive = i === shown;
        const inner = (
          <>
            <span className="relative flex items-center justify-center w-9 h-9">
              <span
                aria-hidden="true"
                className={`absolute -top-1 -left-1 text-[10px] leading-none rounded-full px-1 py-0.5 ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-surface-elev text-fg-faint'
                }`}
              >
                {i + 1}
              </span>
              <span className={`block w-9 h-9 ${isActive ? 'animate-step-active' : ''}`}>
                <StepIcon id={step} active={isActive} />
              </span>
            </span>
            <span className="text-[10px] leading-tight text-center truncate w-full">
              {getStepLabel(step, locale)}
            </span>
          </>
        );

        return (
          <li key={step + i} className="shrink-0 w-16">
            {interactive ? (
              <button
                type="button"
                onClick={() => setPinned(pinned === i ? null : i)}
                className={`group flex flex-col items-center gap-1 w-full rounded-xl py-1.5 px-1 transition-colors ${
                  isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' : 'text-fg-faint'
                }`}
                aria-pressed={pinned === i}
              >
                {inner}
              </button>
            ) : (
              <div
                className={`flex flex-col items-center gap-1 w-full rounded-xl py-1.5 px-1 ${
                  isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' : 'text-fg-faint'
                }`}
              >
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
