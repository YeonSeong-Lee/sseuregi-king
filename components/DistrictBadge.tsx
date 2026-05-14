'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SUPPORTED_DISTRICTS, getSupportedDistrictInfo } from '@/data/districts';
import type { DistrictState } from '@/hooks/useDistrict';
import type { Locale, SupportedDistrict } from '@/types';

type Translator = ReturnType<typeof useTranslations>;

interface DistrictBadgeProps {
  state: DistrictState;
  locale: Locale;
  onRequestGPS: () => void;
  onSetManual: (code: SupportedDistrict) => void;
  onClear: () => void;
}

function chipText(state: DistrictState, locale: Locale, t: Translator): string {
  switch (state.status) {
    case 'unknown':    return `📍 ${t('district.set')}`;
    case 'detecting':  return `📍 ${t('district.detecting')}`;
    case 'detected':   return `📍 ${state.info.names[locale]}${t('district.auto_suffix')}`;
    case 'manual':     return `📍 ${state.info.names[locale]}`;
    case 'unsupported': return `📍 ${t('district.unsupported_chip', { name: state.info.names[locale] })}`;
    case 'no_match':   return `📍 ${t('district.no_match_chip')}`;
    case 'denied':     return `📍 ${t('district.denied')}`;
  }
}

function chipColor(state: DistrictState): string {
  switch (state.status) {
    case 'detected':
    case 'manual':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40';
    case 'detecting':
      return 'bg-surface-elev text-fg-muted border-line-strong animate-pulse';
    case 'unsupported':
    case 'no_match':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40';
    case 'denied':
    case 'unknown':
    default:
      return 'bg-surface-elev text-fg-faint border-line-strong';
  }
}

export function DistrictBadge({ state, locale, onRequestGPS, onSetManual, onClear }: DistrictBadgeProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const currentCode =
    state.status === 'detected' || state.status === 'manual' ? state.info.code : null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${chipColor(state)}`}
      >
        {chipText(state, locale, t)}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 mt-2 w-64 z-40 bg-surface-elev border border-line rounded-2xl shadow-xl p-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { setOpen(false); onRequestGPS(); }}
              className="text-left px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium active:scale-95 transition-transform"
            >
              {t('district.use_gps')}
            </button>

            <div className="text-xs text-fg-faint px-1 pt-1">{t('district.select_manual')}</div>
            {SUPPORTED_DISTRICTS.map(code => {
              const info = getSupportedDistrictInfo(code);
              const active = currentCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => { setOpen(false); onSetManual(code); }}
                  className={`text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40'
                      : 'bg-surface text-fg border border-line'
                  }`}
                >
                  {info.names[locale]}
                </button>
              );
            })}

            {state.status !== 'unknown' && (
              <button
                type="button"
                onClick={() => { setOpen(false); onClear(); }}
                className="text-left px-3 py-2 rounded-xl text-xs text-fg-faint"
              >
                {t('district.skip')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
