// app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { Locale } from '@/types';

const LANGUAGES: { code: Locale; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-8">
      <div className="text-center">
        <div className="text-6xl mb-4">🗑️</div>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-zinc-400 mt-2 text-sm leading-relaxed">{t('subtitle')}</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {LANGUAGES.map(lang => (
          <Link key={lang.code} href={`/${lang.code}/scan`}
            className="flex items-center gap-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl px-5 py-4 text-white text-lg font-medium active:scale-95 transition-transform">
            <span className="text-2xl">{lang.flag}</span>{lang.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
