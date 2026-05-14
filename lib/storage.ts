import type { DistrictPreference, Locale, StorageData, Theme } from '@/types';

const STORAGE_KEY = 'trashdex';
export const THEME_KEY = 'theme';

const defaultData: StorageData = {
  lang: 'en',
  district: null,
};

export function getStorage(): StorageData {
  if (typeof window === 'undefined') return { ...defaultData };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StorageData) : { ...defaultData };
  } catch {
    return { ...defaultData };
  }
}

function setStorage(data: Partial<StorageData>): StorageData {
  const next = { ...getStorage(), ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function setLang(lang: Locale): void {
  setStorage({ lang });
}

export function getDistrict(): DistrictPreference | null {
  return getStorage().district ?? null;
}

export function setDistrict(district: DistrictPreference | null): void {
  setStorage({ district });
}

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
  } catch {
    return 'system';
  }
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage may be disabled */
  }
}
