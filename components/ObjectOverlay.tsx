// components/ObjectOverlay.tsx
'use client';
import { useState } from 'react';
import type { DetectedObject, Locale, WasteCategory } from '@/types';

const NAME_KEY: Record<Locale, keyof Pick<DetectedObject, 'nameEn' | 'nameZh' | 'nameJa' | 'nameRu'>> = {
  en: 'nameEn', zh: 'nameZh', ja: 'nameJa', ru: 'nameRu',
};

const CATEGORY_BG: Record<WasteCategory, string> = {
  recycling: 'bg-blue-500',
  food:      'bg-emerald-500',
  general:   'bg-zinc-600',
  large:     'bg-orange-500',
};

interface ObjectOverlayProps {
  imageBase64: string;
  objects: DetectedObject[];
  locale: Locale;
  tapHint: string;
  seeGuideLabel: string;
  onSeeGuide: (selected: DetectedObject[]) => void;
}

export function ObjectOverlay({ imageBase64, objects, locale, tapHint, seeGuideLabel, onSeeGuide }: ObjectOverlayProps) {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  function toggle(nameEn: string) {
    setSelectedNames(prev => {
      const next = new Set(prev);
      next.has(nameEn) ? next.delete(nameEn) : next.add(nameEn);
      return next;
    });
  }

  const nameKey = NAME_KEY[locale];
  const selected = objects.filter(o => selectedNames.has(o.nameEn));

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-0 bg-black">
        <img src={`data:image/jpeg;base64,${imageBase64}`} alt="scanned trash"
          className="w-full h-full object-contain" />
        {objects.map(obj => {
          const cx = obj.bbox.x + obj.bbox.w / 2;
          const cy = obj.bbox.y + obj.bbox.h / 2;
          const isSelected = selectedNames.has(obj.nameEn);
          return (
            <button key={obj.nameEn} onClick={() => toggle(obj.nameEn)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-sm font-semibold shadow-lg transition-all text-white border border-black/20 ${CATEGORY_BG[obj.category]} ${
                isSelected ? 'ring-2 ring-white scale-110' : ''
              }`}
              style={{ left: `${cx}%`, top: `${cy}%` }}>
              {obj[nameKey]}
            </button>
          );
        })}
      </div>
      <div className="p-4 bg-zinc-900 shrink-0">
        <p className="text-zinc-400 text-sm text-center mb-3">{tapHint}</p>
        <button disabled={selected.length === 0} onClick={() => onSeeGuide(selected)}
          className="w-full bg-purple-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
          {seeGuideLabel} →
        </button>
      </div>
    </div>
  );
}
