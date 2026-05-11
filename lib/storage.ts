import type { DistrictPreference, Locale, StorageData } from '@/types';

const STORAGE_KEY = 'trashdex';

const defaultData: StorageData = {
  lang: 'en',
  unlockedIds: [],
  lastScanAt: null,
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

export function getLang(): Locale {
  return getStorage().lang;
}

export function setLang(lang: Locale): void {
  setStorage({ lang });
}

export function unlockItems(ids: string[]): StorageData {
  const current = getStorage();
  const merged = Array.from(new Set([...current.unlockedIds, ...ids]));
  return setStorage({ unlockedIds: merged, lastScanAt: new Date().toISOString() });
}

export function getUnlockedIds(): string[] {
  return getStorage().unlockedIds;
}

export function getDistrict(): DistrictPreference | null {
  return getStorage().district ?? null;
}

export function setDistrict(district: DistrictPreference | null): void {
  setStorage({ district });
}
