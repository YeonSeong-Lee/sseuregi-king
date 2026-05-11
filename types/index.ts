export type Locale = 'en' | 'zh' | 'ja' | 'ru';
export type WasteCategory = 'recycling' | 'food' | 'general' | 'large';

export interface WasteItem {
  id: string;
  emoji: string;
  category: WasteCategory;
  names: Record<Locale, string>;
  videoUrl: string;
  thumbnailUrl: string;
  aiAliases: string[];
}

export interface BBox {
  x: number; // % of image width (0-100)
  y: number; // % of image height (0-100)
  w: number;
  h: number;
}

export interface DetectedObject {
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameRu: string;
  category: WasteCategory;
  bbox: BBox;
  itemId: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
}

export type SupportedDistrict = 'gangnam' | 'mapo';

export interface DistrictPreference {
  code: SupportedDistrict;
  auto: boolean;
}

export interface StorageData {
  lang: Locale;
  unlockedIds: string[];
  lastScanAt: string | null;
  district: DistrictPreference | null;
}
