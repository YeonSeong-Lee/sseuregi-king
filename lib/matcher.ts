import { matchCategoryByAlias } from '@/lib/categories';
import { findTrashItemByLabel } from '@/lib/trash-items';
import type { DetectedObject, WasteCategory } from '@/types';

const DEFAULT_CATEGORY: WasteCategory = 'etc';

type RawObject = {
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameRu: string;
  category: string;
  bbox: { x: number; y: number; w: number; h: number };
};

function titleCase(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

export function enrichObjects(rawObjects: RawObject[]): DetectedObject[] {
  return rawObjects.map(obj => {
    // 1) Item-level match: most specific guidance wins.
    const item = findTrashItemByLabel(obj.nameEn);
    if (item) {
      const fallbackEn = titleCase(obj.nameEn) || item.names.en;
      return {
        nameEn: item.names.en || fallbackEn,
        // Prefer translation provided by the detector; fall back to item EN, then raw EN.
        nameZh: item.names.zh || obj.nameZh.trim() || item.names.en || fallbackEn,
        nameJa: item.names.ja || obj.nameJa.trim() || item.names.en || fallbackEn,
        nameRu: item.names.ru || obj.nameRu.trim() || item.names.en || fallbackEn,
        category: item.category,
        bbox: obj.bbox,
        trashItemId: item.id,
      };
    }

    // 2) Category fallback (existing behavior).
    const matched = matchCategoryByAlias(obj.nameEn);
    const en = titleCase(obj.nameEn) || '?';
    const suffix = matched ? '' : ' ❓';
    return {
      nameEn: en + suffix,
      nameZh: (obj.nameZh.trim() || en) + suffix,
      nameJa: (obj.nameJa.trim() || en) + suffix,
      nameRu: (obj.nameRu.trim() || en) + suffix,
      category: matched ?? DEFAULT_CATEGORY,
      bbox: obj.bbox,
    };
  });
}
