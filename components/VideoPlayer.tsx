// components/VideoPlayer.tsx
'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BagIcon } from '@/components/BagIcon';
import { SpeechBubble } from '@/components/SpeechBubble';
import { StepRow } from '@/components/StepRow';
import type {
  DetectedObject,
  Locale,
  ScanCategory,
} from '@/types';

const CATEGORY_COLORS: Record<ScanCategory, string> = {
  'Recyclable':    'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  'General Waste': 'bg-zinc-200 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300',
  'Food Waste':    'bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-300',
  'Hazardous':     'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  'Bulky':         'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300',
};

const CONFIDENCE_LABEL: Record<DetectedObject['confidence'], string> = {
  high:   '●●●',
  medium: '●●○',
  low:    '●○○',
};

interface VideoPlayerProps {
  objects: DetectedObject[];
  locale: Locale;
  backLabel: string;
  onBack: () => void;
}

export function VideoPlayer({ objects, locale, backLabel, onBack }: VideoPlayerProps) {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = objects[activeIndex];
  const name = active.name;
  const bagLabel = t(`bag.${active.bag}`);

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center gap-3 p-4 border-b border-line shrink-0">
        <button onClick={onBack} className="text-blue-600 dark:text-blue-400 text-sm font-medium shrink-0">{backLabel}</button>
        <div className="flex-1 min-w-0">
          <span className="block text-fg font-semibold truncate">{name}</span>
          <span className="block text-[10px] text-fg-faint tracking-widest" aria-label={`confidence ${active.confidence}`}>
            {CONFIDENCE_LABEL[active.confidence]}
          </span>
        </div>
        <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[active.category]}`}>
          {active.category}
        </span>
      </div>
      {objects.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-line shrink-0">
          {objects.map((obj, i) => (
            <button
              key={`${obj.name}-${i}`}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm ${i === activeIndex ? 'bg-blue-500 text-white' : 'bg-surface-elev text-fg-muted'}`}
            >
              {obj.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        <div className="pt-1">
          <SpeechBubble shape="card" size="md" tail="up" className="ml-4">
            {active.mascotText[locale] || active.mascotText.en}
          </SpeechBubble>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-elev border border-line text-xs text-fg">
            <BagIcon id={active.bag} />
            <span>{bagLabel}</span>
          </div>
        </div>

        {active.steps.length > 0 && (
          <div className="-mx-1">
            <StepRow
              steps={active.steps.map(s => ({
                visualId: s.visual,
                label: s.text,
              }))}
              interactive
            />
            <p className="text-[10px] text-fg-faint text-center pt-1">{t('guide.pin_step_hint')}</p>
          </div>
        )}

        <section className="rounded-2xl border border-line bg-surface-elev px-4 py-3">
          <h4 className="text-xs uppercase tracking-wide text-fg-faint">
            {t('item.did_you_know')}
          </h4>
          <p className="mt-1 text-sm text-fg leading-relaxed">
            {active.funnyFact[locale] || active.funnyFact.en}
          </p>
        </section>
      </div>
    </div>
  );
}
