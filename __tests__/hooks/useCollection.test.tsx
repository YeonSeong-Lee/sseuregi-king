import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollection } from '@/hooks/useCollection';

beforeEach(() => {
  localStorage.clear();
});

describe('useCollection', () => {
  it('starts with empty unlockedIds', () => {
    const { result } = renderHook(() => useCollection());
    expect(result.current.unlockedIds).toEqual([]);
  });

  it('unlock adds ids and re-renders', () => {
    const { result } = renderHook(() => useCollection());
    act(() => {
      result.current.unlock(['plastic_bottle', 'newspaper']);
    });
    expect(result.current.unlockedIds).toContain('plastic_bottle');
    expect(result.current.unlockedIds).toContain('newspaper');
  });

  it('isUnlocked returns true only for unlocked items', () => {
    const { result } = renderHook(() => useCollection());
    act(() => { result.current.unlock(['glass_bottle']); });
    expect(result.current.isUnlocked('glass_bottle')).toBe(true);
    expect(result.current.isUnlocked('battery')).toBe(false);
  });
});
