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

export type LocalizedText = Record<Locale, string>;

// High-level grouping returned by Claude — distinct from the fine-grained
// `WasteCategory` used by the /guide page. Mapped to a CategoryGroup for UI pills.
export type ScanCategory =
  | 'Recyclable'
  | 'General Waste'
  | 'Food Waste'
  | 'Hazardous'
  | 'Bulky';

// Bag codes: general = White general waste bag, food = Yellow food waste bag,
// recycle = Transparent recycling bag
export type BagCode = 'general' | 'food' | 'recycle';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ScanStep {
  visual: VisualActionId;
  text: string;
}

export interface DetectedObject {
  name: string;
  category: ScanCategory;
  bag: BagCode;
  bbox: BBox;
  steps: ScanStep[];
  mascotText: LocalizedText;
  funnyFact: LocalizedText;
  confidence: ConfidenceLevel;
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

// Visual action IDs — each value matches a file in public/step-icons/<id>.png.
// Authoritative metadata lives in data/visual-actions.json.
// Referenced from data/trash-items.json (actionSteps) and data/waste-categories.json (steps).
export type VisualActionId =
  // Preparation / processing
  | 'REMOVE_CAP_OR_LID_PUMP'
  | 'PEEL_OFF_LABEL_FILM'
  | 'EMPTY_CONTENTS'
  | 'EMPTY_DRINKS_CONTAINER'
  | 'EMPTY_SPRAY_CAN'
  | 'RELEASE_GAS'
  | 'RINSE_LIGHTLY'
  | 'WIPE_FOOD_RESIDUE_BEFORE_RECYCLING'
  | 'REMOVE_FOOD_WASTE'
  | 'REMOVE_TAPE'
  | 'FLATTEN_BOX'
  | 'CRUSH'
  | 'CRUSH_CANS_BOTTLES'
  | 'BREAK_PIECES'
  | 'TIE_BUNDLE'
  | 'SEPARATE_BY_MATERIAL'
  | 'SEPARATIING_CUP_PARTS'
  | 'RECYCLE_METALS'
  // Terminal (final disposal)
  | 'PUT_IN_GENERAL_BIN'
  | 'PUT_IN_RECYCLE_PAPER'
  | 'PUT_IN_RECYCLE_PLASTIC_PET'
  | 'PUT_IN_RECYCLE_GLASS'
  | 'PUT_IN_RECYCLE_CANS_METALS'
  | 'PUT_IN_RECYCLE_BATTERIES_BULBS'
  | 'DONATION_BIN'
  | 'FOOD_WASTE_SEPARATE'
  | 'CALL_COMMUNITY_CENTER';

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
