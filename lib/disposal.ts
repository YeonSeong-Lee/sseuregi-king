import disposalRules from '@/data/disposal-rules.json';
import type { Locale, SupportedDistrict } from '@/types';

type RuleMap = Record<string, Record<string, Record<string, string>>>;

const rules = disposalRules as unknown as RuleMap;

export function getDisposalText(
  itemId: string | null,
  district: SupportedDistrict | null,
  locale: Locale,
): string | null {
  if (!itemId || !district) return null;
  const text = rules[district]?.[itemId]?.[locale];
  return text || null;
}
