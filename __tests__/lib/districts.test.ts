import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_DISTRICTS,
  DISTRICT_BY_KO_NAME,
  isSupported,
  getDistrictByKoName,
  getSupportedDistrictInfo,
} from '@/data/districts';

describe('districts table', () => {
  it('exposes only gangnam and mapo as supported in v1', () => {
    expect(SUPPORTED_DISTRICTS).toEqual(['gangnam', 'mapo']);
  });

  it('contains all 25 Seoul districts keyed by Korean name', () => {
    expect(Object.keys(DISTRICT_BY_KO_NAME)).toHaveLength(25);
    expect(DISTRICT_BY_KO_NAME['강남구']).toBeDefined();
    expect(DISTRICT_BY_KO_NAME['마포구']).toBeDefined();
    expect(DISTRICT_BY_KO_NAME['서초구']).toBeDefined();
  });

  it('every entry has names for all 4 locales', () => {
    for (const [koName, info] of Object.entries(DISTRICT_BY_KO_NAME)) {
      for (const locale of ['en', 'zh', 'ja', 'ru'] as const) {
        expect(info.names[locale], `${koName}.names.${locale}`).toBeTruthy();
      }
    }
  });
});

describe('isSupported', () => {
  it('is true for gangnam and mapo', () => {
    expect(isSupported('gangnam')).toBe(true);
    expect(isSupported('mapo')).toBe(true);
  });

  it('is false for other district codes', () => {
    expect(isSupported('seocho')).toBe(false);
    expect(isSupported('songpa')).toBe(false);
    expect(isSupported('')).toBe(false);
    expect(isSupported('GANGNAM')).toBe(false);
  });
});

describe('getDistrictByKoName', () => {
  it('returns DistrictInfo for known names', () => {
    expect(getDistrictByKoName('강남구')?.code).toBe('gangnam');
    expect(getDistrictByKoName('마포구')?.code).toBe('mapo');
    expect(getDistrictByKoName('서초구')?.code).toBe('seocho');
  });

  it('returns null for unknown names', () => {
    expect(getDistrictByKoName('해운대구')).toBeNull();
    expect(getDistrictByKoName('')).toBeNull();
  });
});

describe('getSupportedDistrictInfo', () => {
  it('round-trips supported codes back to DistrictInfo', () => {
    expect(getSupportedDistrictInfo('gangnam').names.en).toBe('Gangnam-gu');
    expect(getSupportedDistrictInfo('mapo').names.en).toBe('Mapo-gu');
  });
});
