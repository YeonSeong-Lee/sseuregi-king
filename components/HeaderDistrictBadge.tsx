'use client';
import { DistrictBadge } from '@/components/DistrictBadge';
import { useDistrictContext } from '@/contexts/DistrictContext';
import type { Locale } from '@/types';

export function HeaderDistrictBadge({ locale }: { locale: Locale }) {
  const { state, requestGPS, setManual, clear } = useDistrictContext();
  return (
    <DistrictBadge
      state={state}
      locale={locale}
      onRequestGPS={requestGPS}
      onSetManual={setManual}
      onClear={clear}
    />
  );
}
