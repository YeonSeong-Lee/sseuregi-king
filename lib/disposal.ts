import disposalRules from '@/data/disposal-rules.json';
import disposalSteps from '@/data/disposal-steps.json';
import type {
  DisposalRulesFile,
  DisposalStepsFile,
  DistrictRule,
  ItemRule,
  Locale,
  StepId,
  SupportedDistrict,
} from '@/types';

const rules = disposalRules as DisposalRulesFile;
const steps = disposalSteps as DisposalStepsFile;

export function getItemRule(itemId: string): ItemRule | null {
  return rules.items[itemId] ?? null;
}

export function getDisposalRule(
  itemId: string | null,
  district: SupportedDistrict | null,
): { rule: ItemRule; districtRule: DistrictRule } | null {
  if (!itemId || !district) return null;
  const rule = rules.items[itemId];
  if (!rule) return null;
  const districtRule = rule.districts[district];
  if (!districtRule) return null;
  return { rule, districtRule };
}

export function getStepLabel(stepId: StepId, locale: Locale): string {
  return steps.steps[stepId]?.labels[locale] ?? stepId;
}

export function listItemIds(): string[] {
  return Object.keys(rules.items);
}

/**
 * Back-compat shim for VideoPlayer: flattens steps + schedule into one paragraph
 * so the existing post-scan UI keeps working without changes.
 */
export function getDisposalText(
  itemId: string | null,
  district: SupportedDistrict | null,
  locale: Locale,
): string | null {
  const found = getDisposalRule(itemId, district);
  if (!found) return null;
  const stepText = found.rule.steps.map(s => getStepLabel(s, locale)).join(' · ');
  const schedule = found.districtRule.schedule[locale];
  return stepText ? `${stepText}. ${schedule}` : schedule;
}
