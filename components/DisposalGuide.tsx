'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDistrictContext } from '@/contexts/DistrictContext';
import { isSupported, getSupportedDistrictInfo } from '@/data/districts';
import { DisposalCard } from '@/components/DisposalCard';
import { DisposalDetail } from '@/components/DisposalDetail';
import {
  CATEGORY_IDS,
  buildCategoryLabels,
  getCategoryDef,
  getCategoryDisposal,
} from '@/lib/categories';
import type { BagColor, Locale, WasteCategory } from '@/types';

const BAG_KEYS: Record<BagColor, string> = {
  transparent: 'transparent',
  yellow: 'yellow',
  white: 'white',
  green: 'green',
  special: 'special',
  none: 'none',
};

export function DisposalGuide({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const district = useDistrictContext();
  const [activeCategory, setActiveCategory] = useState<WasteCategory | null>(null);

  const supportedCode =
    (district.state.status === 'detected' || district.state.status === 'manual') &&
    isSupported(district.state.info.code)
      ? district.state.info.code
      : null;

  if (!supportedCode) {
    const status = district.state.status;
    const message =
      status === 'unsupported'
        ? t('district.unsupported_hint', { name: district.state.info.names[locale] })
        : status === 'no_match'
        ? t('district.no_match_hint')
        : t('guide.no_district');
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center gap-3">
        <div className="text-5xl" aria-hidden="true">📍</div>
        <p className="text-fg-muted text-sm leading-relaxed">{message}</p>
      </div>
    );
  }

  const districtName = getSupportedDistrictInfo(supportedCode).names[locale];
  const categoryLabels = buildCategoryLabels(t);

  if (activeCategory) {
    const def = getCategoryDef(activeCategory);
    const found = getCategoryDisposal(activeCategory, supportedCode);
    if (def && found) {
      return (
        <DisposalDetail
          category={def}
          steps={found.steps}
          districtRule={found.districtRule}
          locale={locale}
          categoryLabel={categoryLabels[activeCategory]}
          bagLabel={t(`bag.${BAG_KEYS[found.districtRule.bagColor]}`)}
          onBack={() => setActiveCategory(null)}
        />
      );
    }
  }

  return (
    <div className="relative flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <header className="px-4 pt-4 pb-2 sticky top-0 bg-surface/95 backdrop-blur z-10">
        <h1 className="text-xl font-bold text-fg">{t('guide.title')}</h1>
        <p className="text-xs text-fg-faint mt-0.5">{t('guide.subtitle', { name: districtName })}</p>
      </header>
      <ul className="flex flex-col gap-3 px-4 pt-3 pb-8">
        {CATEGORY_IDS.map(id => {
          const def = getCategoryDef(id);
          const found = getCategoryDisposal(id, supportedCode);
          if (!def || !found) return null;
          return (
            <li key={id}>
              <DisposalCard
                category={def}
                steps={found.steps}
                districtRule={found.districtRule}
                locale={locale}
                categoryLabel={categoryLabels[id]}
                bagLabel={t(`bag.${BAG_KEYS[found.districtRule.bagColor]}`)}
                onClick={() => setActiveCategory(id)}
              />
            </li>
          );
        })}
      </ul>
      <p className="text-[10px] text-fg-faint text-center pb-4">{t('guide.tap_card_hint')}</p>
    </div>
  );
}
