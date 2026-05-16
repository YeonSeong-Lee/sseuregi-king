'use client';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { StepIcon } from '@/components/svg/StepIcons';
import type { VisualActionId } from '@/types';

export interface StepItem {
  visualId: VisualActionId;
  label: string;
}

interface StepRowProps {
  steps: StepItem[];
  interactive?: boolean;
}

export function StepRow({ steps }: StepRowProps) {
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

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex < steps.length - 1;

  return (
    <div className="w-full">
      {/* Step counter + progress bar */}
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
                    isActive ? 'bg-surface-elev' : 'bg-surface-elev/40'
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

      {/* Prev / Next arrows */}
      {steps.length > 1 && (
        <div className="flex justify-between items-center px-2 pt-2 pb-1">
          <button
            type="button"
            aria-label="Previous step"
            onClick={() => scrollTo(selectedIndex - 1)}
            disabled={!canPrev}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all duration-150 ${
              canPrev
                ? 'border-fg text-fg active:scale-95'
                : 'border-fg/15 text-fg/20 cursor-default'
            }`}
          >
            ← 이전
          </button>
          <button
            type="button"
            aria-label="Next step"
            onClick={() => scrollTo(selectedIndex + 1)}
            disabled={!canNext}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all duration-150 ${
              canNext
                ? 'border-fg text-fg active:scale-95'
                : 'border-fg/15 text-fg/20 cursor-default'
            }`}
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  );
}
