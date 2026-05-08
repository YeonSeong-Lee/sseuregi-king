// app/[locale]/collection/page.tsx
'use client';
import { use } from 'react';
import { useTranslations } from 'next-intl';
import { TrashDex } from '@/components/TrashDex';
import { useCollection } from '@/hooks/useCollection';
import wasteItemsData from '@/data/waste-items.json';
import type { WasteItem, Locale } from '@/types';

const allItems = Object.values(wasteItemsData) as WasteItem[];

export default function CollectionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations('collection');
  const { unlockedIds } = useCollection();

  return (
    <TrashDex
      items={allItems}
      unlockedIds={unlockedIds}
      locale={locale as Locale}
      lockedLabel={t('locked')}
      progressTemplate={t('progress')}
    />
  );
}
