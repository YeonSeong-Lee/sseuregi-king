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
      {/* Step counter */}
      {steps.length > 1 && (
        <div className="flex items-center gap-2 px-2 pt-2 pb-1">
          <span className="text-xs font-bold text-fg tracking-wide">
            {selectedIndex + 1} / {steps.length}
          </span>
          <div className="flex-1 flex items-center gap-1">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Step ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === selectedIndex
                    ? 'bg-fg flex-[2]'
                    : i < selectedIndex
                      ? 'bg-fg/40 flex-1'
                      : 'bg-fg/15 flex-1'
                }`}
              />
            ))}
          </div>
        </div>
      )}

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
                      ? 'bg-surface-elev border-2 border-fg'
                      : 'bg-surface-elev/40 border-2 border-transparent'
                  }`}
                >
                  {/* Step number badge */}
                  <span
                    className={`absolute top-2.5 left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none transition-all duration-200 ${
                      isActive
                        ? 'bg-fg text-accent-fg scale-110'
                        : 'bg-fg/15 text-fg-faint'
                    }`}
                  >
                    {i + 1}
                  </span>

                  {/* Icon */}
                  <div
                    className={`w-40 h-40 transition-transform duration-200 ${
                      isActive ? 'scale-105' : 'scale-95 opacity-50'
                    }`}
                  >
                    <StepIcon id={step.visualId} />
                  </div>

                  {/* Label */}
                  <p
                    className={`text-sm leading-snug text-center font-semibold ${
                      isActive ? 'text-fg' : 'text-fg-faint'
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
    </div>
  );
}
