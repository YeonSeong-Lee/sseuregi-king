// components/DetectedItemList.tsx
'use client';
import { getCategoryGroup, type CategoryGroup } from '@/lib/categories';
import { getTrashItemById } from '@/lib/trash-items';
import type { DetectedObject, Locale } from '@/types';

const NAME_KEY: Record<Locale, keyof Pick<DetectedObject, 'nameEn' | 'nameZh' | 'nameJa' | 'nameRu'>> = {
  en: 'nameEn', zh: 'nameZh', ja: 'nameJa', ru: 'nameRu',
};

const GROUP_PILL: Record<CategoryGroup, string> = {
  recyclable: 'bg-emerald-700 text-white',
  food: 'bg-orange-600 text-white',
  general: 'bg-zinc-500 text-white',
};

interface DetectedItemListProps {
  objects: DetectedObject[];
  locale: Locale;
  groupLabels: Record<CategoryGroup, string>;
  onTapItem: (obj: DetectedObject) => void;
}

export function DetectedItemList({ objects, locale, groupLabels, onTapItem }: DetectedItemListProps) {
  const nameKey = NAME_KEY[locale];
  return (
    <ul className="flex flex-col gap-3 w-full">
      {objects.map((obj, i) => {
        const group = getCategoryGroup(obj.category);
        const item = obj.trashItemId ? getTrashItemById(obj.trashItemId) : undefined;
        return (
          <li key={`${obj.nameEn}-${i}`}>
            <button
              type="button"
              onClick={() => onTapItem(obj)}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl border-2 border-fg bg-surface-elev text-left active:scale-[0.98] transition-transform"
            >
              <span
                aria-hidden="true"
                className="shrink-0 w-9 h-9 rounded-full bg-fg text-accent-fg flex items-center justify-center font-bold text-sm"
              >
                {i + 1}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-[family-name:var(--font-fraunces)] font-bold text-lg truncate">
                  {obj[nameKey]}
                </span>
                {item?.koreanTag && (
                  <span className="block text-[11px] text-fg-faint truncate">{item.koreanTag}</span>
                )}
              </span>
              <span
                className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${GROUP_PILL[group]}`}
              >
                {groupLabels[group]}
              </span>
              <span aria-hidden="true" className="shrink-0 text-2xl text-fg leading-none">→</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
