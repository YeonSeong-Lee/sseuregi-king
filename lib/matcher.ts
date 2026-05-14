import { ETC_NAMES, getCategoryDef, matchCategoryByAlias } from '@/lib/categories';
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
      nameEn: ETC_NAMES.en,
      nameZh: ETC_NAMES.zh,
      nameJa: ETC_NAMES.ja,
      nameRu: ETC_NAMES.ru,
      category: DEFAULT_CATEGORY,
      bbox: obj.bbox,
    };
  });
}
