'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDistrictContext } from '@/contexts/DistrictContext';
import { isSupported, getSupportedDistrictInfo } from '@/data/districts';
import { getDisposalRule, listItemIds } from '@/lib/disposal';
import { CategoryChips } from '@/components/CategoryChips';
import { DisposalCard } from '@/components/DisposalCard';
import wasteItemsData from '@/data/waste-items.json';
import type { BagColor, Locale, WasteCategory, WasteItem } from '@/types';

const ALL_ITEMS = Object.values(wasteItemsData) as WasteItem[];

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
  const [active, setActive] = useState<WasteCategory | 'all'>('all');

  const supportedCode =
    (district.state.status === 'detected' || district.state.status === 'manual') &&
    isSupported(district.state.info.code)
      ? district.state.info.code
      : null;

  const ruleItemIds = useMemo(() => listItemIds(), []);
  const itemsWithRule = useMemo(
    () => ALL_ITEMS.filter(item => ruleItemIds.includes(item.id)),
    [ruleItemIds],
  );
  const filtered = useMemo(
    () => (active === 'all' ? itemsWithRule : itemsWithRule.filter(i => i.category === active)),
    [itemsWithRule, active],
  );

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
        <p className="text-zinc-300 text-sm leading-relaxed">{message}</p>
      </div>
    );
  }

  const districtName = getSupportedDistrictInfo(supportedCode).names[locale];
  const categoryLabels: Record<WasteCategory, string> = {
    recycling: t('categories.recycling'),
    food:      t('categories.food'),
    general:   t('categories.general'),
    large:     t('categories.large'),
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <header className="px-4 pt-4 pb-2 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <h1 className="text-xl font-bold text-white">{t('guide.title')}</h1>
        <p className="text-xs text-zinc-400 mt-0.5">{t('guide.subtitle', { name: districtName })}</p>
      </header>
      <div className="pt-2">
        <CategoryChips
          active={active}
          onChange={setActive}
          labels={categoryLabels}
          allLabel={t('guide.all')}
        />
      </div>
      <ul className="flex flex-col gap-3 px-4 pt-3 pb-8">
        {filtered.map(item => {
          const found = getDisposalRule(item.id, supportedCode);
          if (!found) return null;
          return (
            <li key={item.id}>
              <DisposalCard
                item={item}
                rule={found.rule}
                districtRule={found.districtRule}
                locale={locale}
                categoryLabel={categoryLabels[item.category]}
                bagLabel={t(`bag.${BAG_KEYS[found.districtRule.bagColor]}`)}
              />
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="text-center text-sm text-zinc-500 py-8">{t('guide.empty_category')}</li>
        )}
      </ul>
      <p className="text-[10px] text-zinc-600 text-center pb-4">{t('guide.pin_step_hint')}</p>
    </div>
  );
}
