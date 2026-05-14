import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { BottomNav } from '@/components/BottomNav';
import { LanguagePicker } from '@/components/LanguagePicker';
import { HeaderDistrictBadge } from '@/components/HeaderDistrictBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DistrictProvider } from '@/contexts/DistrictContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/types';

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
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <DistrictProvider>
          <div className="flex flex-col h-dvh w-full max-w-md mx-auto bg-surface text-fg">
            <header className="flex justify-end items-center gap-2 px-4 py-2 border-b border-line flex-shrink-0">
              <HeaderDistrictBadge locale={locale as Locale} />
              <LanguagePicker locale={locale} />
              <ThemeToggle />
            </header>
            <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
            <BottomNav locale={locale} scanLabel={t('scan')} guideLabel={t('guide')} />
          </div>
        </DistrictProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
