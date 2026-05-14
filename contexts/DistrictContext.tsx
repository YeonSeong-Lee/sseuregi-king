'use client';
import { createContext, useContext } from 'react';
import { useDistrict } from '@/hooks/useDistrict';

type DistrictContextValue = ReturnType<typeof useDistrict>;

const DistrictContext = createContext<DistrictContextValue | null>(null);

export function DistrictProvider({ children }: { children: React.ReactNode }) {
  const value = useDistrict();
  return <DistrictContext.Provider value={value}>{children}</DistrictContext.Provider>;
}

export function useDistrictContext(): DistrictContextValue {
  const ctx = useContext(DistrictContext);
  if (!ctx) throw new Error('useDistrictContext must be used inside <DistrictProvider>');
  return ctx;
}
