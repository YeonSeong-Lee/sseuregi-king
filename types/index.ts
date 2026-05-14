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
  district: DistrictPreference | null;
}

export type BagColor = 'transparent' | 'yellow' | 'white' | 'green' | 'special' | 'none';

export type StepId =
  | 'empty'
  | 'rinse'
  | 'remove_label'
  | 'remove_cap'
  | 'crush_flat'
  | 'flatten'
  | 'bundle_dry'
  | 'remove_tape_staples'
  | 'drain_water'
  | 'bag_transparent'
  | 'bag_food_waste'
  | 'bag_special'
  | 'drop_off_battery'
  | 'drop_off_dong_center'
  | 'request_pickup_ewaste';

export interface DisposalStep {
  id: StepId;
  icon: StepId;
  labels: Record<Locale, string>;
}

export type BagType = 'recycle' | 'food' | 'general' | 'special' | 'none';

export interface DistrictRule {
  bagColor: BagColor;
  bagType: BagType;
  schedule: Record<Locale, string>;
}

export interface ItemRule {
  steps: StepId[];
  districts: Partial<Record<SupportedDistrict, DistrictRule>>;
}

export interface DisposalRulesFile {
  _sources: Record<string, string>;
  items: Record<string, ItemRule>;
}

export interface DisposalStepsFile {
  steps: Record<StepId, DisposalStep>;
}
