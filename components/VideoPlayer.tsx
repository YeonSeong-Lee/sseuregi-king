// components/VideoPlayer.tsx
'use client';
import { useState } from 'react';
import type { DetectedObject, Locale } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  recycling: 'bg-blue-500/20 text-blue-400',
  food: 'bg-green-500/20 text-green-400',
  general: 'bg-zinc-500/20 text-zinc-400',
  large: 'bg-orange-500/20 text-orange-400',
};

const NAME_KEY: Record<Locale, keyof Pick<DetectedObject, 'nameEn' | 'nameZh' | 'nameJa' | 'nameRu'>> = {
  en: 'nameEn', zh: 'nameZh', ja: 'nameJa', ru: 'nameRu',
};

interface VideoPlayerProps {
  objects: DetectedObject[];
  locale: Locale;
  categoryLabels: Record<string, string>;
  backLabel: string;
  noVideoLabel: string;
  onBack: () => void;
  disposalTexts?: Record<string, string | null>;
}

export function VideoPlayer({
  objects, locale, categoryLabels, backLabel, noVideoLabel, onBack,
  disposalTexts,
}: VideoPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = objects[activeIndex];
  const nameKey = NAME_KEY[locale];
  const activeKey = active.itemId ?? active.nameEn;
  const disposalText = disposalTexts?.[activeKey] ?? null;
  const showDisposal = disposalText !== null;

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800 shrink-0">
        <button onClick={onBack} className="text-blue-400 text-sm font-medium shrink-0">{backLabel}</button>
        <span className="text-white font-semibold truncate">{active[nameKey]}</span>
        <span className={`ml-auto shrink-0 text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[active.category] ?? ''}`}>
          {categoryLabels[active.category]}
        </span>
      </div>
      {objects.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-zinc-800 shrink-0">
          {objects.map((obj, i) => (
            <button key={`${obj.nameEn}-${i}`} onClick={() => setActiveIndex(i)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm ${i === activeIndex ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
              {obj[nameKey]}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        {active.videoUrl
          ? <video key={active.videoUrl} src={active.videoUrl} controls autoPlay className="w-full max-h-full rounded-xl" />
          : <p className="text-zinc-400 text-center">{noVideoLabel}</p>
        }
      </div>
      {showDisposal && (
        <div className="px-4 py-3 border-t border-zinc-800 shrink-0 bg-zinc-900/60">
          <p className="text-zinc-200 text-sm leading-relaxed">{disposalText}</p>
        </div>
      )}
    </div>
  );
}
