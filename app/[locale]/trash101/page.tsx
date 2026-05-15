'use client';
import { use } from 'react';
import { Trash101 } from '@/components/Trash101';
import type { Locale } from '@/types';

export default function Trash101Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return <Trash101 locale={locale as Locale} />;
}
