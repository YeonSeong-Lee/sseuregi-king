'use client';
import { use } from 'react';
import { DisposalGuide } from '@/components/DisposalGuide';
import type { Locale } from '@/types';

export default function CollectionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return <DisposalGuide locale={locale as Locale} />;
}
