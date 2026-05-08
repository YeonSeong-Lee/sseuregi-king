import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { BottomNav } from '@/components/BottomNav';
import { LanguagePicker } from '@/components/LanguagePicker';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

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
      <div className="flex flex-col h-dvh w-full max-w-md mx-auto bg-zinc-950 text-white">
        <header className="flex justify-end items-center px-4 py-2 border-b border-zinc-800 flex-shrink-0">
          <LanguagePicker locale={locale} />
        </header>
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        <BottomNav locale={locale} scanLabel={t('scan')} collectionLabel={t('collection')} />
      </div>
    </NextIntlClientProvider>
  );
}
