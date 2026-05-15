import type { Metadata } from 'next';
import Link from 'next/link';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { LanguagePicker } from '@/components/LanguagePicker';
import { HeaderDistrictBadge } from '@/components/HeaderDistrictBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DistrictProvider } from '@/contexts/DistrictContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/types';

const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ru: 'ru_RU',
};

const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Saregi Killer — a worried blob mascot',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t('title');
  const description = t('description');
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}`]));
  return {
    title,
    description,
    alternates: { canonical: `/${locale}`, languages },
    openGraph: {
      type: 'website',
      siteName: 'Saregi Killer',
      title,
      description,
      locale: OG_LOCALE[locale] ?? 'en_US',
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l] ?? 'en_US'),
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <DistrictProvider>
          <div className="flex flex-col h-dvh w-full max-w-md mx-auto bg-surface text-fg">
            <header className="flex justify-between items-center gap-2 px-4 py-2 border-b border-line flex-shrink-0">
              <Link
                href={`/${locale}/scan`}
                className="font-[family-name:var(--font-fraunces)] font-black text-base tracking-tight"
              >
                SAREGI
              </Link>
              <div className="flex items-center gap-2">
                <HeaderDistrictBadge locale={locale as Locale} />
                <LanguagePicker locale={locale} />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
          </div>
        </DistrictProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
