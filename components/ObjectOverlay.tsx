// components/ObjectOverlay.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { DetectedObject, Locale, WasteCategory } from '@/types';

const NAME_KEY: Record<Locale, keyof Pick<DetectedObject, 'nameEn' | 'nameZh' | 'nameJa' | 'nameRu'>> = {
  en: 'nameEn', zh: 'nameZh', ja: 'nameJa', ru: 'nameRu',
};

const CATEGORY_BG: Record<WasteCategory, string> = {
  paper:        'bg-amber-500',
  paper_carton: 'bg-yellow-500',
  glass:        'bg-emerald-500',
  metal_can:    'bg-slate-400',
  plastic:      'bg-blue-500',
  vinyl:        'bg-cyan-500',
  styrofoam:    'bg-rose-300',
  clothing:     'bg-violet-500',
  lightbulb:    'bg-orange-400',
  food:         'bg-lime-500',
  general:      'bg-zinc-600',
  e_waste:      'bg-indigo-500',
  large:        'bg-red-500',
  etc:          'bg-slate-500/70',
};

interface ObjectOverlayProps {
  imageBase64: string;
  objects: DetectedObject[];
  locale: Locale;
  tapHint: string;
  seeGuideLabel: string;
  selectAllLabel: string;
  deselectAllLabel: string;
  retakeLabel: string;
  onSeeGuide: (selected: DetectedObject[]) => void;
  onRetake: () => void;
}

export function ObjectOverlay({ imageBase64, objects, locale, tapHint, seeGuideLabel, selectAllLabel, deselectAllLabel, retakeLabel, onSeeGuide, onRetake }: ObjectOverlayProps) {
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
        <button type="button" onClick={onRetake}
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-medium backdrop-blur-sm border border-white/20 active:scale-95 transition-transform">
          <span aria-hidden>📷</span>
          {retakeLabel}
        </button>
        {objects.map((obj, i) => {
          const cx = obj.bbox.x + obj.bbox.w / 2;
          const cy = obj.bbox.y + obj.bbox.h / 2;
          const isSelected = selectedNames.has(obj.nameEn);
          return (
            <button key={`${obj.nameEn}-${i}`} onClick={() => toggle(obj.nameEn)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-sm font-semibold shadow-lg transition-all text-white ${
                obj.category === 'etc' ? 'border-2 border-dashed border-white/70' : 'border border-black/20'
              } ${CATEGORY_BG[obj.category]} ${
                isSelected ? 'ring-2 ring-white scale-110' : ''
              }`}
              style={{ left: `${cx}%`, top: `${cy}%` }}>
              {obj[nameKey]}
            </button>
          );
        })}
      </div>
      <div className="p-4 bg-surface-elev shrink-0">
        <div className="flex items-center justify-between mb-3 gap-3">
          <p className="text-fg-muted text-sm">{tapHint}</p>
          <button type="button" onClick={toggleAll} disabled={objects.length === 0}
            className="text-fg text-sm font-medium underline underline-offset-2 disabled:text-fg-faint disabled:no-underline shrink-0">
            {allSelected ? deselectAllLabel : selectAllLabel}
          </button>
        </div>
        <button disabled={selected.length === 0} onClick={() => onSeeGuide(selected)}
          className="w-full bg-purple-600 disabled:opacity-40 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
          {seeGuideLabel} →
        </button>
      </div>
    </div>
  );
}
