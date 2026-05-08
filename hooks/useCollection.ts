'use client';
import { useState, useCallback } from 'react';
import { getUnlockedIds, unlockItems } from '@/lib/storage';

export function useCollection() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => getUnlockedIds());

  const unlock = useCallback((ids: string[]) => {
    const updated = unlockItems(ids);
    setUnlockedIds(updated.unlockedIds);
  }, []);

  const isUnlocked = useCallback(
    (id: string) => unlockedIds.includes(id),
    [unlockedIds],
  );

  return { unlockedIds, unlock, isUnlocked };
}
