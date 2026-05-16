// components/VideoPlayer.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
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

const MASCOT_BY_CATEGORY: Record<ScanCategory, string> = {
  'Recyclable':    '/mascots/mascot-happy.png',
  'General Waste': '/mascots/mascot-idle.png',
  'Food Waste':    '/mascots/mascot-happy.png',
  'Hazardous':     '/mascots/mascot-reject.png',
  'Bulky':         '/mascots/mascot-idle.png',
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
  const mascotSrc = MASCOT_BY_CATEGORY[active.category];

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header — 2-line layout */}
      <div className="px-4 pt-3 pb-2 border-b border-line shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium"
          >
            {backLabel}
          </button>
          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[active.category]}`}>
            {active.category}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-bold text-fg truncate flex-1">{name}</span>
          <span
            className="shrink-0 text-[10px] text-fg-faint tracking-widest"
            aria-label={`confidence ${active.confidence}`}
          >
            {CONFIDENCE_LABEL[active.confidence]}
          </span>
        </div>
      </div>

      {/* Multi-item tabs */}
      {objects.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-line shrink-0">
          {objects.map((obj, i) => (
            <button
              key={`${obj.name}-${i}`}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm transition-colors ${
                i === activeIndex
                  ? `${CATEGORY_COLORS[obj.category]} font-medium`
                  : 'bg-surface-elev text-fg-muted'
              }`}
            >
              {obj.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {/* Mascot speaking section */}
        <div className="rounded-2xl bg-surface-elev border border-line p-4">
          <div className="flex items-end gap-3">
            <Image
              src={mascotSrc}
              alt="mascot"
              width={80}
              height={80}
              className="shrink-0 object-contain"
            />
            <div className="flex-1 flex flex-col gap-2 min-w-0 pb-1">
              <SpeechBubble shape="card" size="md" tail="left">
                {active.mascotText[locale] || active.mascotText.en}
              </SpeechBubble>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface border border-line text-xs text-fg self-start">
                <BagIcon id={active.bag} />
                <span>{bagLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step row */}
        {active.steps.length > 0 && (
          <div className="-mx-1">
            <StepRow
              steps={active.steps.map(s => ({
                visualId: s.visual,
                label: s.text,
              }))}
              interactive
            />
          </div>
        )}

        {/* Did you know */}
        <div className="flex items-end gap-3">
          <Image
            src={mascotSrc}
            alt="mascot"
            width={64}
            height={64}
            className="shrink-0 object-contain"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-fg-muted mb-1">
              {t('item.did_you_know')}
            </p>
            <SpeechBubble shape="card" size="md" tail="left" className="w-full">
              {active.funnyFact[locale] || active.funnyFact.en}
            </SpeechBubble>
          </div>
        </div>
      </div>
    </div>
  );
}
