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
  trashItemId?: string;
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

export type ActionStepId =
  // Existing 16 (used by /data/waste-categories.json):
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
  | 'request_pickup_ewaste'
  // New from /data/trash-items.json (CSV-derived):
  | 'peel_label'
  | 'remove_pump'
  | 'shake_off_food'
  | 'wipe_clean'
  | 'bundle_together'
  | 'remove_tape'
  | 'remove_sticker'
  | 'break_pieces'
  | 'put_in_bag'
  | 'flatten_box'
  | 'tie_with_string'
  | 'remove_plastic_inserts'
  | 'stack_flat'
  | 'return_for_deposit'
  | 'place_gently'
  | 'empty_food'
  | 'use_until_empty'
  | 'puncture_hole_outdoors'
  | 'place_in_bin'
  | 'drain_moisture'
  | 'put_in_food_bag'
  | 'wrap_in_newspaper'
  | 'find_collection_box'
  | 'drop_in'
  | 'drop_in_carefully'
  | 'take_to_pharmacy'
  | 'drop_in_box'
  | 'cool_down'
  | 'pour_in_container'
  | 'take_to_collection'
  | 'check_wearable'
  | 'fold_neatly'
  | 'drop_in_bin'
  | 'register_online'
  | 'pay_fee'
  | 'attach_sticker_and_place_outside'
  | 'check_free_pickup'
  | 'attach_sticker'
  | 'call_1599_0903'
  | 'schedule_pickup'
  | 'place_outside'
  | 'empty_liquid'
  | 'rinse_inside';

// Legacy name — same union, kept so existing imports keep compiling.
export type StepId = ActionStepId;

export interface DisposalStep {
  id: ActionStepId;
  icon: ActionStepId;
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
  steps: Partial<Record<ActionStepId, DisposalStep>>;
}

export interface TrashItem {
  id: string;
  category: WasteCategory;
  names: Record<Locale, string>;
  aliases: string[];
  destination: Record<Locale, string>;
  bagColor: BagColor;
  actionSteps: ActionStepId[];
  funnyMascot: Record<Locale, string>;
  funnyFact: Record<Locale, string>;
  isBulky: boolean;
  bulkyWebsiteUrl: string | null;
}

export interface TrashItemsFile {
  items: TrashItem[];
}
