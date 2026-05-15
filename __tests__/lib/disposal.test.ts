import { describe, it, expect } from 'vitest';
import {
  CATEGORY_IDS,
  getCategoryDef,
  getCategoryDisposal,
  getCategoryDisposalText,
} from '@/lib/categories';
import { getActionLabel, getVisualAction } from '@/lib/disposal';
import { SUPPORTED_DISTRICTS } from '@/data/districts';
import visualActions from '@/data/visual-actions.json';
import type { VisualActionId } from '@/types';

const BAG_COLORS = new Set(['transparent', 'yellow', 'white', 'green', 'special', 'none']);
const BAG_TYPES = new Set(['recycle', 'food', 'general', 'special', 'none']);
const ACTION_IDS = new Set(Object.keys(visualActions.actions));

describe('getCategoryDisposal', () => {
  it('returns null when district is missing', () => {
    expect(getCategoryDisposal('plastic', null)).toBeNull();
  });

  it('returns structured rule for known (category, district)', () => {
    const found = getCategoryDisposal('plastic', 'gangnam');
    expect(found).not.toBeNull();
    // Plastic recycling starts with V04 (Empty Contents).
    expect(found!.steps).toContain<VisualActionId>('V04');
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
          expect(ACTION_IDS.has(stepId), `${id} step "${stepId}" not in library`).toBe(true);
        }
        for (const locale of ['en', 'zh', 'ja', 'ru'] as const) {
          expect(found!.districtRule.schedule[locale].length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('visual-actions.json library', () => {
  it('every action has at least an English name; non-EN may be empty (UI falls back to EN)', () => {
    for (const [actionId, action] of Object.entries(visualActions.actions)) {
      expect(action.id).toBe(actionId);
      expect(action.name.en.length, `${actionId} missing English name`).toBeGreaterThan(0);
      for (const locale of ['zh', 'ja', 'ru'] as const) {
        expect(typeof action.name[locale], `${actionId} ${locale} should be a string`).toBe('string');
      }
    }
  });
});

describe('getCategoryDisposalText', () => {
  it('joins action labels and schedule for VideoPlayer', () => {
    const text = getCategoryDisposalText('plastic', 'gangnam', 'en');
    // V04 = Empty Contents / Pour Out, V05 = Rinse With Water.
    expect(text).toContain('Empty');
    expect(text).toContain('Rinse');
    expect(text).toMatch(/thursday/i);
  });

  it('returns null when inputs missing', () => {
    expect(getCategoryDisposalText('plastic', null, 'en')).toBeNull();
  });
});

describe('getActionLabel / getVisualAction', () => {
  it('returns the action name for a known visualId', () => {
    expect(getActionLabel('V04', 'en')).toBe('Empty Contents / Pour Out');
  });

  it('falls back to English when the locale label is empty', () => {
    expect(getActionLabel('V04', 'ja')).toBe('Empty Contents / Pour Out');
  });

  it('exposes the underlying action record', () => {
    const a = getVisualAction('V01');
    expect(a?.name.en).toMatch(/Cap/);
    expect(a?.animation).toBeTruthy();
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
    expect(CATEGORY_IDS).toHaveLength(13);
  });
});
