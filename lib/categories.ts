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
  'large',
];

// `categoriesData` also carries an `_sources` key alongside the 12 category
// entries. We only ever index by `WasteCategory` so the extra key is benign.
const categories = categoriesData as unknown as Record<WasteCategory, WasteCategoryDef>;

export function getCategoryDef(id: WasteCategory): WasteCategoryDef {
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
  return Object.fromEntries(
    CATEGORY_IDS.map(id => [id, t(`categories.${id}`)]),
  ) as Record<WasteCategory, string>;
}

export function getCategoryName(id: WasteCategory, locale: Locale): string {
  return categories[id].names[locale];
}

export function getCategoryExamples(id: WasteCategory, locale: Locale): string | null {
  return categories[id].examples[locale] ?? null;
}

export function getCategoryDisposal(
  id: WasteCategory,
  district: SupportedDistrict | null,
): { steps: StepId[]; districtRule: DistrictRule } | null {
  if (!district) return null;
  const def = categories[id];
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
