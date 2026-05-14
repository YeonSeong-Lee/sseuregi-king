'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  DISTRICT_BY_KO_NAME,
  getDistrictByKoName,
  getSupportedDistrictInfo,
  isSupported,
  type DistrictInfo,
} from '@/data/districts';
import { getDistrict, setDistrict as persistDistrict } from '@/lib/storage';
import type { SupportedDistrict } from '@/types';

export type DistrictState =
  | { status: 'unknown' }
  | { status: 'detecting' }
  | { status: 'detected'; info: DistrictInfo; auto: true }
  | { status: 'manual'; info: DistrictInfo; auto: false }
  | { status: 'unsupported'; info: DistrictInfo }
  | { status: 'no_match' }
  | { status: 'denied'; reason: 'permission' | 'unavailable' | 'geocode' };

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 5 * 60_000,
    });
  });
}

export function useDistrict() {
  const [state, setState] = useState<DistrictState>({ status: 'unknown' });

  useEffect(() => {
    const stored = getDistrict();
    if (!stored) return;
    const info = getSupportedDistrictInfo(stored.code);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount; SSR can't read it
    setState(stored.auto
      ? { status: 'detected', info, auto: true }
      : { status: 'manual', info, auto: false });
  }, []);

  const requestGPS = useCallback(async () => {
    setState({ status: 'detecting' });
    let pos: GeolocationPosition;
    try {
      pos = await getCurrentPosition();
    } catch (err) {
      const reason =
        err instanceof GeolocationPositionError && err.code === err.PERMISSION_DENIED
          ? 'permission'
          : 'unavailable';
      setState({ status: 'denied', reason });
      return;
    }

    let koName: string | null;
    try {
      const res = await fetch(
        `/api/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`,
      );
      if (!res.ok) throw new Error('geocode failed');
      const body = (await res.json()) as { koName: string | null };
      koName = body.koName;
    } catch {
      setState({ status: 'denied', reason: 'geocode' });
      return;
    }

    const info = koName ? getDistrictByKoName(koName) : null;
    if (!info) {
      setState({ status: 'no_match' });
      persistDistrict(null);
      return;
    }
    if (isSupported(info.code)) {
      setState({ status: 'detected', info, auto: true });
      persistDistrict({ code: info.code, auto: true });
    } else {
      setState({ status: 'unsupported', info });
      persistDistrict(null);
    }
  }, []);

  const setManual = useCallback((code: SupportedDistrict) => {
    const info = getSupportedDistrictInfo(code);
    setState({ status: 'manual', info, auto: false });
    persistDistrict({ code, auto: false });
  }, []);

  const clear = useCallback(() => {
    setState({ status: 'unknown' });
    persistDistrict(null);
  }, []);

  return { state, requestGPS, setManual, clear, allDistricts: DISTRICT_BY_KO_NAME };
}
