import wasteItemsData from '@/data/waste-items.json';
import type { WasteItem, WasteCategory, DetectedObject } from '@/types';

const wasteItems = wasteItemsData as Record<string, WasteItem>;

export function matchItem(nameEn: string): WasteItem | null {
  const normalized = nameEn.toLowerCase().trim();
  for (const item of Object.values(wasteItems)) {
    if (item.aiAliases.some(alias => alias.toLowerCase() === normalized)) {
      return item;
    }
  }
  return null;
}

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
    const match = matchItem(obj.nameEn);
    return {
      nameEn: match?.names.en ?? obj.nameEn,
      nameZh: match?.names.zh ?? obj.nameZh,
      nameJa: match?.names.ja ?? obj.nameJa,
      nameRu: match?.names.ru ?? obj.nameRu,
      category: (match?.category ?? obj.category) as WasteCategory,
      bbox: obj.bbox,
      itemId: match?.id ?? null,
      videoUrl: match?.videoUrl ?? null,
      thumbnailUrl: match?.thumbnailUrl ?? null,
    };
  });
}

export function getAllItems(): WasteItem[] {
  return Object.values(wasteItems);
}
