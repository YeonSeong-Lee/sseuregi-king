import { describe, it, expect } from 'vitest';
import {
  CATEGORY_IDS,
  getCategoryDef,
  getCategoryDisposal,
  getCategoryDisposalText,
} from '@/lib/categories';
import { getStepLabel } from '@/lib/disposal';
import { SUPPORTED_DISTRICTS } from '@/data/districts';
import disposalSteps from '@/data/disposal-steps.json';

const BAG_COLORS = new Set(['transparent', 'yellow', 'white', 'green', 'special', 'none']);
const BAG_TYPES = new Set(['recycle', 'food', 'general', 'special', 'none']);
const STEP_IDS = new Set(Object.keys(disposalSteps.steps));

describe('getCategoryDisposal', () => {
  it('returns null when district is missing', () => {
    expect(getCategoryDisposal('plastic', null)).toBeNull();
  });

  it('returns structured rule for known (category, district)', () => {
    const found = getCategoryDisposal('plastic', 'gangnam');
    expect(found).not.toBeNull();
    expect(found!.steps).toContain('empty');
    expect(found!.districtRule.bagColor).toBe('transparent');
    expect(found!.districtRule.schedule.en).toMatch(/thursday/i);
  });

  it('resolves every (category × supported district) pair with valid enum values', () => {
    for (const id of CATEGORY_IDS) {
      for (const district of SUPPORTED_DISTRICTS) {
        const found = getCategoryDisposal(id, district);
        expect(found, `${id} / ${district}`).not.toBeNull();
        expect(found!.steps.length).toBeGreaterThan(0);
        expect(BAG_COLORS.has(found!.districtRule.bagColor)).toBe(true);
        expect(BAG_TYPES.has(found!.districtRule.bagType)).toBe(true);
        for (const stepId of found!.steps) {
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

describe('getCategoryDisposalText', () => {
  it('joins step labels and schedule for VideoPlayer', () => {
    const text = getCategoryDisposalText('plastic', 'gangnam', 'en');
    expect(text).toContain('Empty');
    expect(text).toContain('Rinse');
    expect(text).toMatch(/thursday/i);
  });

  it('returns null when inputs missing', () => {
    expect(getCategoryDisposalText('plastic', null, 'en')).toBeNull();
  });
});

describe('getStepLabel', () => {
  it('returns localized label', () => {
    expect(getStepLabel('empty', 'en')).toBe('Empty');
    expect(getStepLabel('empty', 'ja')).toBe('中身を空に');
  });

  it('returns label for the new bag_general step', () => {
    expect(getStepLabel('bag_general', 'en')).toBe('General-waste bag');
  });
});

describe('getCategoryDef', () => {
  it('returns the catalog entry for a known category', () => {
    expect(getCategoryDef('food').names.en).toBe('Food Waste');
  });

  it('aliases etc → general so disposal data still resolves', () => {
    expect(getCategoryDef('etc')).toBe(getCategoryDef('general'));
  });
});

describe('etc pseudo-category', () => {
  it('produces the same disposal text as general', () => {
    expect(getCategoryDisposalText('etc', 'gangnam', 'en')).toBe(
      getCategoryDisposalText('general', 'gangnam', 'en'),
    );
    expect(getCategoryDisposalText('etc', 'mapo', 'ja')).toBe(
      getCategoryDisposalText('general', 'mapo', 'ja'),
    );
  });

  it('is excluded from CATEGORY_IDS so it never leaks into the filter row', () => {
    expect(CATEGORY_IDS).not.toContain('etc');
    expect(CATEGORY_IDS).toHaveLength(12);
  });
});
