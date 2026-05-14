import { describe, it, expect } from 'vitest';
import {
  getDisposalRule,
  getDisposalText,
  getItemRule,
  getStepLabel,
  listItemIds,
} from '@/lib/disposal';
import { SUPPORTED_DISTRICTS } from '@/data/districts';
import disposalSteps from '@/data/disposal-steps.json';

const BAG_COLORS = new Set(['transparent', 'yellow', 'white', 'green', 'special', 'none']);
const BAG_TYPES = new Set(['recycle', 'food', 'general', 'special', 'none']);
const STEP_IDS = new Set(Object.keys(disposalSteps.steps));

describe('getDisposalRule', () => {
  it('returns null for unknown item', () => {
    expect(getDisposalRule('nope', 'gangnam')).toBeNull();
  });

  it('returns null when district missing', () => {
    expect(getDisposalRule('plastic_bottle', null)).toBeNull();
  });

  it('returns structured rule for known (item, district)', () => {
    const found = getDisposalRule('plastic_bottle', 'gangnam');
    expect(found).not.toBeNull();
    expect(found!.rule.steps).toContain('empty');
    expect(found!.districtRule.bagColor).toBe('transparent');
    expect(found!.districtRule.schedule.en).toMatch(/thursday/i);
  });

  it('resolves every (item × supported district) pair with valid enum values', () => {
    for (const id of listItemIds()) {
      for (const district of SUPPORTED_DISTRICTS) {
        const found = getDisposalRule(id, district);
        expect(found, `${id} / ${district}`).not.toBeNull();
        expect(found!.rule.steps.length).toBeGreaterThan(0);
        expect(BAG_COLORS.has(found!.districtRule.bagColor)).toBe(true);
        expect(BAG_TYPES.has(found!.districtRule.bagType)).toBe(true);
        for (const stepId of found!.rule.steps) {
          expect(STEP_IDS.has(stepId), `${id} step "${stepId}" not in library`).toBe(true);
        }
        for (const locale of ['en', 'zh', 'ja', 'ru'] as const) {
          expect(found!.districtRule.schedule[locale].length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('disposal-steps.json library', () => {
  it('every step has a label in every locale', () => {
    for (const [stepId, step] of Object.entries(disposalSteps.steps)) {
      expect(step.id).toBe(stepId);
      expect(STEP_IDS.has(step.icon)).toBe(true);
      for (const locale of ['en', 'zh', 'ja', 'ru'] as const) {
        expect(step.labels[locale]?.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('getDisposalText (compat shim)', () => {
  it('joins step labels and schedule for VideoPlayer', () => {
    const text = getDisposalText('plastic_bottle', 'gangnam', 'en');
    expect(text).toContain('Empty');
    expect(text).toContain('Rinse');
    expect(text).toMatch(/thursday/i);
  });

  it('returns null when inputs missing', () => {
    expect(getDisposalText(null, 'gangnam', 'en')).toBeNull();
    expect(getDisposalText('plastic_bottle', null, 'en')).toBeNull();
    expect(getDisposalText('unknown', 'gangnam', 'en')).toBeNull();
  });
});

describe('getStepLabel', () => {
  it('returns localized label', () => {
    expect(getStepLabel('empty', 'en')).toBe('Empty');
    expect(getStepLabel('empty', 'ja')).toBe('中身を空に');
  });
});

describe('getItemRule', () => {
  it('returns the item rule', () => {
    expect(getItemRule('food_waste')?.steps).toContain('drain_water');
  });
  it('returns null for missing item', () => {
    expect(getItemRule('missing')).toBeNull();
  });
});
