import categoriesData from '@/data/waste-categories.json';
import { getStepLabel } from '@/lib/disposal';
import type {
  DistrictRule,
  Locale,
  StepId,
  SupportedDistrict,
  WasteCategory,
  WasteCategoryDef,
} from '@/types';

export type CategoryGroup = 'recyclable' | 'food' | 'general';

const CATEGORY_GROUP: Record<WasteCategory, CategoryGroup> = {
  paper: 'recyclable',
  paper_carton: 'recyclable',
  glass: 'recyclable',
  metal_can: 'recyclable',
  plastic: 'recyclable',
  vinyl: 'recyclable',
  styrofoam: 'recyclable',
  clothing: 'recyclable',
  lightbulb: 'recyclable',
  e_waste: 'recyclable',
  food: 'food',
  general: 'general',
  large: 'general',
  etc: 'general',
};

export function getCategoryGroup(c: WasteCategory): CategoryGroup {
  return CATEGORY_GROUP[c];
}

export const CATEGORY_IDS: WasteCategory[] = [
  'paper',
  'paper_carton',
  'glass',
  'metal_can',
  'plastic',
  'vinyl',
  'styrofoam',
  'clothing',
  'lightbulb',
  'food',
  'general',
  'e_waste',
  'large',
];

// `etc` is a pseudo-category used when detection can't be alias-matched.
// It deliberately stays out of CATEGORY_IDS so it never appears in the
// /guide filter row or disposal cards, but it aliases to `general` at the
// data-lookup boundary so VideoPlayer / disposal text fall back gracefully.
export const ETC_NAMES: Record<Locale, string> = {
  en: 'Other ❓',
  zh: '其他 ❓',
  ja: 'その他 ❓',
  ru: 'Другое ❓',
};

// `categoriesData` also carries an `_sources` key alongside the 12 category
// entries. We only ever index by `WasteCategory` so the extra key is benign.
const categories = categoriesData as unknown as Record<WasteCategory, WasteCategoryDef>;

export function getCategoryDef(id: WasteCategory): WasteCategoryDef {
  if (id === 'etc') return categories.general;
  return categories[id];
}

export function matchCategoryByAlias(label: string): WasteCategory | null {
  const normalized = label.toLowerCase().trim();
  if (!normalized) return null;
  for (const id of CATEGORY_IDS) {
    const def = categories[id];
    if (def.aliases.some(alias => alias.toLowerCase() === normalized)) {
      return id;
    }
  }
  return null;
}

export function buildCategoryLabels(
  t: (key: string) => string,
): Record<WasteCategory, string> {
  return {
    ...Object.fromEntries(CATEGORY_IDS.map(id => [id, t(`categories.${id}`)])),
    etc: t('categories.etc'),
  } as Record<WasteCategory, string>;
}

export function getCategoryName(id: WasteCategory, locale: Locale): string {
  if (id === 'etc') return ETC_NAMES[locale];
  return categories[id].names[locale];
}

export function getCategoryExamples(id: WasteCategory, locale: Locale): string | null {
  if (id === 'etc') return null;
  return categories[id].examples[locale] ?? null;
}

export function getCategoryDisposal(
  id: WasteCategory,
  district: SupportedDistrict | null,
): { steps: StepId[]; districtRule: DistrictRule } | null {
  if (!district) return null;
  const def = getCategoryDef(id);
  if (!def) return null;
  const districtRule = def.districts[district];
  if (!districtRule) return null;
  return { steps: def.steps, districtRule };
}

export function getCategoryDisposalText(
  id: WasteCategory,
  district: SupportedDistrict | null,
  locale: Locale,
): string | null {
  const found = getCategoryDisposal(id, district);
  if (!found) return null;
  const stepText = found.steps.map(s => getStepLabel(s, locale)).join(' · ');
  const schedule = found.districtRule.schedule[locale];
  return stepText ? `${stepText}. ${schedule}` : schedule;
}
