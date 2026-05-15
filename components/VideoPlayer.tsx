// components/VideoPlayer.tsx
'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BagChip } from '@/components/BagChip';
import { SpeechBubble } from '@/components/SpeechBubble';
import { StepRow } from '@/components/StepRow';
import { YoutubeLinkCard } from '@/components/YoutubeLinkCard';
import { getCategoryDef } from '@/lib/categories';
import { getActionLabel } from '@/lib/disposal';
import { getYoutubeVideo } from '@/lib/youtube';
import {
  getTrashItemById,
  getTrashItemDestination,
  getTrashItemFunnyFact,
  getTrashItemMascot,
  getTrashItemSpecialNote,
} from '@/lib/trash-items';
import type {
  BagColor,
  DetectedObject,
  Locale,
  SupportedDistrict,
  WasteCategory,
} from '@/types';

const CATEGORY_COLORS: Record<WasteCategory, string> = {
  paper:        'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  paper_carton: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  glass:        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  metal_can:    'bg-slate-200 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200',
  plastic:      'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  vinyl:        'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300',
  styrofoam:    'bg-rose-100 text-rose-700 dark:bg-rose-300/20 dark:text-rose-200',
  clothing:     'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300',
  lightbulb:    'bg-orange-100 text-orange-800 dark:bg-orange-400/20 dark:text-orange-300',
  food:         'bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-300',
  general:      'bg-zinc-200 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300',
  e_waste:      'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300',
  large:        'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  etc:          'bg-slate-100 text-slate-700 border border-dashed border-slate-400 dark:bg-slate-500/20 dark:text-slate-200 dark:border-slate-400/60',
};

const NAME_KEY: Record<Locale, keyof Pick<DetectedObject, 'nameEn' | 'nameZh' | 'nameJa' | 'nameRu'>> = {
  en: 'nameEn', zh: 'nameZh', ja: 'nameJa', ru: 'nameRu',
};

interface VideoPlayerProps {
  objects: DetectedObject[];
  locale: Locale;
  district: SupportedDistrict | null;
  categoryLabels: Record<WasteCategory, string>;
  backLabel: string;
  watchOnYoutubeLabel: string;
  onBack: () => void;
  disposalTexts?: Record<string, string | null>;
}

export function VideoPlayer({
  objects, locale, district, categoryLabels, backLabel, watchOnYoutubeLabel, onBack,
  disposalTexts,
}: VideoPlayerProps) {
  const t = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = objects[activeIndex];
  const nameKey = NAME_KEY[locale];
  const video = getYoutubeVideo(active.category, locale);
  const item = active.trashItemId ? getTrashItemById(active.trashItemId) : undefined;

  // Resolve bag color. For Gangnam, use the item's bag color. For Mapo (or unknown
  // district), use the category's district rule so guidance stays district-accurate.
  let bagColor: BagColor = 'none';
  if (item && district === 'gangnam') {
    bagColor = item.bagColor;
  } else if (district) {
    const def = active.category === 'etc' ? null : getCategoryDef(active.category);
    bagColor = def?.districts[district]?.bagColor ?? 'none';
  }
  const bagLabel = t(`bag.${bagColor}`);

  const disposalText = disposalTexts?.[active.category] ?? null;
  const showFallbackDisposal = !item && disposalText !== null;
  const showBulkyCta = !!(item?.isBulky && item.bulkyWebsiteUrl && district === 'gangnam');

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center gap-3 p-4 border-b border-line shrink-0">
        <button onClick={onBack} className="text-blue-600 dark:text-blue-400 text-sm font-medium shrink-0">{backLabel}</button>
        <div className="flex-1 min-w-0">
          <span className="block text-fg font-semibold truncate">{active[nameKey]}</span>
          {item?.koreanTag && (
            <span className="block text-[11px] text-fg-faint truncate">{item.koreanTag}</span>
          )}
        </div>
        {item?.isHazardous && (
          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-semibold tracking-wide">
            ⚠ {t('item.hazardous')}
          </span>
        )}
        <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[active.category]}`}>
          {categoryLabels[active.category]}
        </span>
      </div>
      {objects.length > 1 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-line shrink-0">
          {objects.map((obj, i) => (
            <button key={`${obj.nameEn}-${i}`} onClick={() => setActiveIndex(i)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm ${i === activeIndex ? 'bg-blue-500 text-white' : 'bg-surface-elev text-fg-muted'}`}>
              {obj[nameKey]}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {item && (
          <div className="pt-1">
            <SpeechBubble shape="card" size="md" tail="up" className="ml-4">
              {getTrashItemMascot(item, locale)}
            </SpeechBubble>
          </div>
        )}

        {item && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-fg-muted leading-tight flex-1">
              <span className="text-fg-faint">{t('item.goes_in')} </span>
              <span className="text-fg font-medium">{getTrashItemDestination(item, locale)}</span>
            </p>
            <BagChip color={bagColor} label={bagLabel} />
          </div>
        )}

        {item && item.actionSteps.length > 0 && (
          <div className="-mx-1">
            <StepRow
              steps={item.actionSteps.map(s => ({
                visualId: s.visualId,
                label: s.text[locale] || s.text.en || getActionLabel(s.visualId, locale),
              }))}
              interactive
            />
            <p className="text-[10px] text-fg-faint text-center pt-1">{t('guide.pin_step_hint')}</p>
          </div>
        )}

        {item && getTrashItemSpecialNote(item, locale) && (
          <p className="text-xs italic text-fg-muted leading-relaxed px-1">
            <span className="text-fg-faint">{t('item.note_prefix')} </span>
            {getTrashItemSpecialNote(item, locale)}
          </p>
        )}

        {showBulkyCta && item && (
          <a
            href={item.bulkyWebsiteUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-2xl border-2 border-fg bg-red-50 dark:bg-red-500/15 px-4 py-3 font-semibold text-fg active:scale-95 transition-transform"
          >
            {t('item.register_bulky')} →
          </a>
        )}

        {item && (
          <section className="rounded-2xl border border-line bg-surface-elev px-4 py-3">
            <h4 className="text-xs uppercase tracking-wide text-fg-faint">
              {t('item.did_you_know')}
            </h4>
            <p className="mt-1 text-sm text-fg leading-relaxed">
              {getTrashItemFunnyFact(item, locale)}
            </p>
          </section>
        )}

        <div className="pt-1">
          <YoutubeLinkCard key={video.id} video={video} ctaLabel={watchOnYoutubeLabel} />
        </div>

        {showFallbackDisposal && (
          <p className="text-fg text-sm leading-relaxed rounded-2xl border border-line bg-surface-elev px-4 py-3">
            {disposalText}
          </p>
        )}
      </div>
    </div>
  );
}
