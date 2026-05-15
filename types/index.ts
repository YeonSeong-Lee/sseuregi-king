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
  | 'large'
  | 'e_waste'
  | 'etc';

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
  trashItemId?: string; // T001..T150 when an item-level match landed
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

// Visual action IDs — sourced from visual_actions_library.csv (V01–V39 + V45).
// Keys in `data/visual-actions.json` and referenced from `data/trash-items.json` and
// each category's `steps` array in `data/waste-categories.json`.
export type VisualActionId =
  | 'V01' | 'V02' | 'V03' | 'V04' | 'V05' | 'V06' | 'V07' | 'V08' | 'V09' | 'V10'
  | 'V11' | 'V12' | 'V13' | 'V14' | 'V15' | 'V16' | 'V17' | 'V18' | 'V19' | 'V20'
  | 'V21' | 'V22' | 'V23' | 'V24' | 'V25' | 'V26' | 'V27' | 'V28' | 'V29' | 'V30'
  | 'V31' | 'V32' | 'V33' | 'V34' | 'V35' | 'V36' | 'V37' | 'V38' | 'V39' | 'V45';

export interface VisualAction {
  id: VisualActionId;
  name: Record<Locale, string>;
  description: string;
  animation: string;
}

export interface VisualActionsFile {
  actions: Partial<Record<VisualActionId, VisualAction>>;
}

// Per-item disposal step: a visual + a contextual label.
export interface ActionStep {
  visualId: VisualActionId;
  text: Record<Locale, string>;
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
  steps: VisualActionId[];
  districts: Partial<Record<SupportedDistrict, DistrictRule>>;
}

export interface TrashItem {
  id: string;                          // T001..T150 (stable)
  category: WasteCategory;             // mapped from CSV category × sub_category
  subCategory: string;                 // verbatim CSV sub_category
  names: Record<Locale, string>;
  koreanTag: string;                   // CSV korean_tag — display + matching
  aliases: string[];
  destination: Record<Locale, string>;
  bagColor: BagColor;
  actionSteps: ActionStep[];           // max 3
  funnyMascot: Record<Locale, string>;
  funnyFact: Record<Locale, string>;
  isBulky: boolean;
  isHazardous: boolean;
  bulkyWebsiteUrl: string | null;
  specialNote: Record<Locale, string>;
}

export interface TrashItemsFile {
  items: TrashItem[];
}
