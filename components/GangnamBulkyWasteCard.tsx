'use client';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/types';

interface GangnamBulkyWasteCardProps {
  locale: Locale;
}

const APPLIANCES_URL = 'https://www.15990903.or.kr';
const APPLIANCES_PHONE = '1599-0903';
const FURNITURE_URL = 'https://clean.gangnam.go.kr/use/biwa/USEBIWA02010000.do';
const FURNITURE_PHONE = '1522-3833';

export function GangnamBulkyWasteCard({ locale }: GangnamBulkyWasteCardProps) {
  const t = useTranslations('gangnam_bulky');

  return (
    <div className="rounded-2xl border border-line bg-surface-elev overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <span aria-hidden="true" className="text-xl">🗂️</span>
        <h3 className="text-sm font-semibold text-fg">{t('title')}</h3>
      </div>

      {/* Section 1: Appliances — Free */}
      <div className="px-4 py-3 border-b border-line">
        <p className="text-xs font-semibold text-fg mb-0.5">{t('appliances_label')}</p>
        <p className="text-xs text-fg-muted leading-relaxed mb-2">{t('appliances_desc')}</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={APPLIANCES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:border-line-strong active:bg-surface-soft transition-colors"
          >
            {t('appliances_cta')}
            <span aria-hidden="true">↗</span>
          </a>
          <a
            href={`tel:${APPLIANCES_PHONE}`}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:border-line-strong active:bg-surface-soft transition-colors"
          >
            <span aria-hidden="true">📞</span>
            {APPLIANCES_PHONE}
          </a>
        </div>
      </div>

      {/* Section 2: Furniture — Paid */}
      <div className="px-4 py-3 border-b border-line">
        <p className="text-xs font-semibold text-fg mb-0.5">{t('furniture_label')}</p>
        <p className="text-xs text-fg-muted leading-relaxed mb-2">{t('furniture_desc')}</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={FURNITURE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:border-line-strong active:bg-surface-soft transition-colors"
          >
            {t('furniture_cta')}
            <span aria-hidden="true">↗</span>
          </a>
          <a
            href={`tel:${FURNITURE_PHONE}`}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:border-line-strong active:bg-surface-soft transition-colors"
          >
            <span aria-hidden="true">📞</span>
            {FURNITURE_PHONE}
          </a>
        </div>
      </div>

      {/* Note */}
      <div className="px-4 py-3 bg-amber-50 dark:bg-amber-500/10">
        <p className="text-xs text-fg leading-relaxed">
          <span aria-hidden="true" className="mr-1">⚠️</span>
          {t('note')}
        </p>
      </div>
    </div>
  );
}
