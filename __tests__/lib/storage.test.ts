import { describe, it, expect, beforeEach } from 'vitest';
import { getStorage, setLang } from '@/lib/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('getStorage', () => {
  it('returns defaults when localStorage is empty', () => {
    const data = getStorage();
    expect(data.lang).toBe('en');
    expect(data.district).toBeNull();
  });
});

describe('setLang', () => {
  it('persists lang to localStorage', () => {
    setLang('ja');
    expect(getStorage().lang).toBe('ja');
  });
});
