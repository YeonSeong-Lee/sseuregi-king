import { matchCategoryByAlias } from '@/lib/categories';
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
