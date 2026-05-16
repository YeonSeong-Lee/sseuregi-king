'use client';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { StepIcon } from '@/components/svg/StepIcons';
import type { VisualActionId } from '@/types';

const CYCLE_MS = 1500;

export interface StepItem {
  visualId: VisualActionId;
  label: string;
}

interface StepRowProps {
  steps: StepItem[];
  interactive?: boolean;
}

export function StepRow({ steps, interactive = true }: StepRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  // Auto-cycle for non-interactive (scan result / card) mode
  useEffect(() => {
    if (interactive) return;
    if (!emblaApi || steps.length === 0) return;
    const id = setInterval(() => {
      const next = (emblaApi.selectedScrollSnap() + 1) % steps.length;
      emblaApi.scrollTo(next);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [emblaApi, interactive, steps.length]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  return (
    <div className="w-full">
      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {steps.map((step, i) => {
            const isActive = i === selectedIndex;
            return (
              <div key={`${step.visualId}-${i}`} className="flex-none w-full px-2">
                <div
                  className={`relative flex flex-col items-center gap-3 rounded-2xl py-5 px-4 transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 ring-2 ring-blue-400 dark:bg-blue-500/15 dark:ring-blue-500'
                      : 'bg-surface-elev/40'
                  }`}
                >
                  {/* Step number badge */}
                  <span
                    className={`absolute top-2.5 left-3 text-xs font-semibold leading-none rounded-full px-1.5 py-0.5 ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-surface-elev text-fg-faint'
                    }`}
                  >
                    {i + 1}
                  </span>

                  {/* Icon */}
                  <div
                    className={`w-40 h-40 transition-transform duration-200 ${
                      isActive ? 'scale-105' : 'scale-95 opacity-60'
                    }`}
                  >
                    <StepIcon id={step.visualId} />
                  </div>

                  {/* Label */}
                  <p
                    className={`text-sm leading-snug text-center font-medium ${
                      isActive ? 'text-blue-700 dark:text-blue-300' : 'text-fg-faint'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicator */}
      {steps.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-3">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Step ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === selectedIndex
                  ? 'bg-blue-500 w-3 h-2'
                  : 'bg-surface-elev w-2 h-2 hover:bg-fg-faint'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
