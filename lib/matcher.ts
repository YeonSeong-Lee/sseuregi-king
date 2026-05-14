import { getCategoryDef, matchCategoryByAlias } from '@/lib/categories';
import type { DetectedObject, WasteCategory } from '@/types';

const DEFAULT_CATEGORY: WasteCategory = 'general';

type RawObject = {
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameRu: string;
  category: string;
  bbox: { x: number; y: number; w: number; h: number };
};

export function enrichObjects(rawObjects: RawObject[]): DetectedObject[] {
  return rawObjects.map(obj => {
    const matched = matchCategoryByAlias(obj.nameEn);
    if (matched) {
      const def = getCategoryDef(matched);
      return {
        nameEn: def.names.en,
        nameZh: def.names.zh,
        nameJa: def.names.ja,
        nameRu: def.names.ru,
        category: matched,
        bbox: obj.bbox,
      };
    }
    return {
      nameEn: obj.nameEn,
      nameZh: obj.nameZh,
      nameJa: obj.nameJa,
      nameRu: obj.nameRu,
      category: DEFAULT_CATEGORY,
      bbox: obj.bbox,
    };
  });
}
