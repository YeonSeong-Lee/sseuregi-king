import { describe, it, expect, beforeEach } from 'vitest';
import { getStorage, setLang, unlockItems, getUnlockedIds } from '@/lib/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('getStorage', () => {
  it('returns defaults when localStorage is empty', () => {
    const data = getStorage();
    expect(data.lang).toBe('en');
    expect(data.unlockedIds).toEqual([]);
    expect(data.lastScanAt).toBeNull();
  });
});

describe('setLang', () => {
  it('persists lang to localStorage', () => {
    setLang('ja');
    expect(getStorage().lang).toBe('ja');
  });
});

describe('unlockItems', () => {
  it('adds new item ids', () => {
    unlockItems(['plastic_bottle']);
    unlockItems(['newspaper']);
    const ids = getUnlockedIds();
    expect(ids).toContain('plastic_bottle');
    expect(ids).toContain('newspaper');
  });

  it('deduplicates ids', () => {
    unlockItems(['plastic_bottle']);
    unlockItems(['plastic_bottle']);
    const count = getUnlockedIds().filter(id => id === 'plastic_bottle').length;
    expect(count).toBe(1);
  });

  it('sets lastScanAt to an ISO string', () => {
    unlockItems(['plastic_bottle']);
    expect(getStorage().lastScanAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
