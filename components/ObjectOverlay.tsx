// components/ObjectOverlay.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
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
  selectAllLabel: string;
  deselectAllLabel: string;
  onSeeGuide: (selected: DetectedObject[]) => void;
}

export function ObjectOverlay({ imageBase64, objects, locale, tapHint, seeGuideLabel, selectAllLabel, deselectAllLabel, onSeeGuide }: ObjectOverlayProps) {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  function toggle(nameEn: string) {
    setSelectedNames(prev => {
      const next = new Set(prev);
      if (next.has(nameEn)) next.delete(nameEn);
      else next.add(nameEn);
      return next;
    });
  }

  const allSelected = objects.length > 0 && selectedNames.size === objects.length;

  function toggleAll() {
    setSelectedNames(allSelected ? new Set() : new Set(objects.map(o => o.nameEn)));
  }

  const nameKey = NAME_KEY[locale];
  const selected = Array.from(
    new Map(
      objects.filter(o => selectedNames.has(o.nameEn)).map(o => [o.nameEn, o])
    ).values()
  );

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-0 bg-black">
        <Image src={`data:image/jpeg;base64,${imageBase64}`} alt="scanned trash"
          fill unoptimized className="object-contain" />
        {objects.map((obj, i) => {
          const cx = obj.bbox.x + obj.bbox.w / 2;
          const cy = obj.bbox.y + obj.bbox.h / 2;
          const isSelected = selectedNames.has(obj.nameEn);
          return (
            <button key={`${obj.nameEn}-${i}`} onClick={() => toggle(obj.nameEn)}
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
        <div className="flex items-center justify-between mb-3 gap-3">
          <p className="text-zinc-400 text-sm">{tapHint}</p>
          <button type="button" onClick={toggleAll} disabled={objects.length === 0}
            className="text-zinc-300 text-sm font-medium underline underline-offset-2 disabled:text-zinc-600 disabled:no-underline shrink-0">
            {allSelected ? deselectAllLabel : selectAllLabel}
          </button>
        </div>
        <button disabled={selected.length === 0} onClick={() => onSeeGuide(selected)}
          className="w-full bg-purple-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
          {seeGuideLabel} →
        </button>
      </div>
    </div>
  );
}
