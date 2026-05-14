export type Locale = 'en' | 'zh' | 'ja' | 'ru';

export type WasteCategory =
  | 'paper'
  | 'paper_carton'
  | 'glass'
  | 'metal_can'
  | 'plastic'
  | 'vinyl'
  | 'styrofoam'
  | 'clothing'
  | 'lightbulb'
  | 'food'
  | 'general'
  | 'large';

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
}

export interface YoutubePick {
  id: string;
  title: string;
}

export type SupportedDistrict = 'gangnam' | 'mapo';

export interface DistrictPreference {
  code: SupportedDistrict;
  auto: boolean;
}

export type Theme = 'system' | 'light' | 'dark';

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
  | 'bag_general'
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

export interface WasteCategoryDef {
  id: WasteCategory;
  emoji: string;
  names: Record<Locale, string>;
  aliases: string[];
  examples: Record<Locale, string>;
  youtube?: Partial<Record<Locale, YoutubePick>>;
  steps: StepId[];
  districts: Partial<Record<SupportedDistrict, DistrictRule>>;
}

export interface DisposalStepsFile {
  steps: Record<StepId, DisposalStep>;
}
